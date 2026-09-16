import { Board } from "@/components/Board";
import { InviteMemberForm } from "@/components/InviteMemberForm";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { Board as BoardType } from "@/types/board";

async function getBoard(projectId: string): Promise<BoardType | null> {
  const supabase = await createClient();
  const { data: project, error } = await supabase
    .from("projects")
    .select("id, name")
    .eq("id", projectId)
    .single();

  if (error || !project) return null;

  const { data: columns } = await supabase
    .from("columns")
    .select("id, name, position, cards(id, title, description, position)")
    .eq("project_id", projectId)
    .order("position");

  return {
    id: project.id,
    name: project.name,
    columns: (columns ?? []).map((col) => ({
      id: col.id,
      name: col.name,
      cards: (col.cards ?? []).sort((a, b) => a.position - b.position),
    })),
  };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const board = await getBoard(id);
  if (!board) {
    return <div className="p-6 text-sm text-gray-500">Projet introuvable ou accès non autorisé.</div>;
  }

  const { data: membership } = await supabase
    .from("project_members")
    .select("role")
    .eq("project_id", id)
    .eq("user_id", user.id)
    .single();

  return (
    <div>
      <div className="max-w-3xl mx-auto pt-6 px-6">
        <InviteMemberForm projectId={id} isOwner={membership?.role === "owner"} />
      </div>
      <Board initialBoard={board} />
    </div>
  );
}