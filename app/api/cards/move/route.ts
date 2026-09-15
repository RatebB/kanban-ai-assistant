import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { z } from "zod";

const requestSchema = z.object({
  sourceColumnId: z.string().uuid(),
  targetColumnId: z.string().uuid(), 
  targetCardIds: z.array(z.string().uuid()),  
  sourceCardIds: z.array(z.string().uuid()),
});

export async function PATCH(request: Request) {
  const body = await request.json();
  const parsed = requestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Données invalides." }, { status: 400 });
  }

  const { targetColumnId, sourceColumnId, targetCardIds, sourceCardIds } = parsed.data;

 
  const updates = [
    ...targetCardIds.map((id, index) => ({
      id,
      column_id: targetColumnId,
      position: index,
    })),
  ];

  
  if (sourceColumnId !== targetColumnId) {
    updates.push(
      ...sourceCardIds.map((id, index) => ({
        id,
        column_id: sourceColumnId,
        position: index,
      }))
    );
  }

    const supabase = getSupabase();
  const results = await Promise.all(
    
    updates.map((u) =>
      supabase 
        .from("cards")
        .update({ column_id: u.column_id, position: u.position })
        .eq("id", u.id)
    )
  );

  const failedUpdate = results.find((r) => r.error);
  if (failedUpdate?.error) {
    return NextResponse.json({ error: failedUpdate.error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}