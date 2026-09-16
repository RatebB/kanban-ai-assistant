import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const requestSchema = z.object({
  email: z.string().email(),
  role: z.enum(["owner", "member"]),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: projectId } = await params;
  const body = await request.json();
  const parsed = requestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Email ou rôle invalide." }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  // Vérifie que l'appelant est bien owner de CE projet
  const { data: membership } = await supabase
    .from("project_members")
    .select("role")
    .eq("project_id", projectId)
    .eq("user_id", user.id)
    .single();

  if (membership?.role !== "owner") {
    return NextResponse.json(
      { error: "Seul le propriétaire du projet peut inviter des membres." },
      { status: 403 }
    );
  }

  // Cherche l'utilisateur invité par son email
  const { data: invitedProfile, error: profileError } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", parsed.data.email)
    .single();

  if (profileError || !invitedProfile) {
    return NextResponse.json(
      { error: "Aucun compte trouvé avec cet email. La personne doit d'abord s'inscrire." },
      { status: 404 }
    );
  }

  const { error: insertError } = await supabase.from("project_members").insert({
    project_id: projectId,
    user_id: invitedProfile.id,
    role: parsed.data.role,
  });

  if (insertError) {
    // Cas fréquent : la personne est déjà membre 
    if (insertError.code === "23505") {
      return NextResponse.json(
        { error: "Cette personne est déjà membre du projet." },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}