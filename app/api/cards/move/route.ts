import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function PATCH(request: Request) {
  const { cardId, targetColumnId, newPosition } = await request.json();

  const { error } = await supabase
    .from("cards")
    .update({ column_id: targetColumnId, position: newPosition })
    .eq("id", cardId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}