import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { z } from "zod";

const requestSchema = z.object({
  columnId: z.string().uuid(),
  subtasks: z
    .array(
      z.object({
        title: z.string().min(1),
        description: z.string().optional(),
      })
    )
    .min(1),
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = requestSchema.safeParse(body);
console.log("Payload reçu:", JSON.stringify(body, null, 2));
  if (!parsed.success) {
    return NextResponse.json({ error: "Données invalides." }, { status: 400 });
  }

  const { columnId, subtasks } = parsed.data;

  const supabase = getSupabase()
  const { data: existing } = await supabase
    .from("cards")
    .select("position")
    .eq("column_id", columnId)
    .order("position", { ascending: false })
    .limit(1);

  const startPosition = existing?.[0]?.position != null ? existing[0].position + 1 : 0;

  const rows = subtasks.map((task, i) => ({
    column_id: columnId,
    title: task.title,
    description: task.description ?? null,
    position: startPosition + i,
  }));

  const { data, error } = await supabase.from("cards").insert(rows).select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ cards: data });
}