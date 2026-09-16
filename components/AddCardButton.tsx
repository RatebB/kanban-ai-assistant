"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Card } from "@/types/board";

type Props = {
  columnId: string;
  onCardCreated: (card: Card) => void;
};

export function AddCardButton({ columnId, onCardCreated }: Props) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleCreate() {
    if (!title.trim()) return;
    setLoading(true);

    const supabase = createClient();

    const { data: existing } = await supabase
      .from("cards")
      .select("position")
      .eq("column_id", columnId)
      .order("position", { ascending: false })
      .limit(1);

    const nextPosition = existing?.[0]?.position != null ? existing[0].position + 1 : 0;

    const { data, error } = await supabase
      .from("cards")
      .insert({ column_id: columnId, title: title.trim(), position: nextPosition })
      .select()
      .single();

    if (error || !data) {
      console.error("Erreur création carte:", error);
      setLoading(false);
      return;
    }

    onCardCreated({ id: data.id, title: data.title, description: data.description ?? undefined });
    setTitle("");
    setEditing(false);
    setLoading(false);
  }

  if (!editing) {
    return (
      <button
        onClick={() => setEditing(true)}
        className="text-xs text-gray-400 hover:text-gray-700 text-left px-1 py-2"
      >
        + Ajouter une carte
      </button>
    );
  }

  return (
    <div className="p-1">
      <textarea
        autoFocus
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleCreate();
          }
          if (e.key === "Escape") setEditing(false);
        }}
        placeholder="Titre de la carte"
        rows={2}
        className="w-full border border-gray-300 rounded-lg p-2 text-sm resize-none"
      />
      <div className="flex gap-2 mt-2">
        <button
          onClick={handleCreate}
          disabled={loading || !title.trim()}
          className="bg-gray-900 text-white rounded-lg px-3 py-1 text-xs font-medium disabled:opacity-40"
        >
          Ajouter
        </button>
        <button
          onClick={() => setEditing(false)}
          className="text-xs text-gray-500"
        >
          Annuler
        </button>
      </div>
    </div>
  );
}