import { Board } from "@/components/Board";
import { getSupabase  } from "@/lib/supabase";
import type { Board as BoardType } from "@/types/board";

const BOARD_ID = "11111111-1111-1111-1111-111111111111";

async function getBoard(): Promise<BoardType> {
  const supabase = getSupabase();
  const { data: board } = await supabase
    .from("boards")
    .select("id, name")
    .eq("id", BOARD_ID)
    .single();

  const { data: columns } = await supabase
    .from("columns")
    .select("id, name, position, cards(id, title, description, position)")
    .eq("board_id", BOARD_ID)
    .order("position");

  return {
    id: board!.id,
    name: board!.name,
    columns: (columns ?? []).map((col) => ({
      id: col.id,
      name: col.name,
      cards: (col.cards ?? []).sort((a, b) => a.position - b.position),
    })),
  };
}

export default async function Home() {
  const board = await getBoard();
  return <Board initialBoard={board} />;
}