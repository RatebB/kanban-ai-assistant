"use client";

import { useState } from "react";
import type { Subtask } from "@/lib/schemas";

type Props = {
  cardTitle: string;
  onClose: () => void;
  onAccept: (subtasks: Subtask[]) => void;
};

export function BreakdownModal({ cardTitle, onClose, onAccept }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());

  async function generateBreakdown() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/ai/breakdown", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskTitle: cardTitle }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Une erreur est survenue.");
        return;
      }

      setSubtasks(data.subtasks);
      setSelected(new Set(data.subtasks.map((_: Subtask, i: number) => i)));
    } catch {
      setError("Impossible de contacter le service IA.");
    } finally {
      setLoading(false);
    }
  }

  function toggle(index: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(index) ? next.delete(index) : next.add(index);
      return next;
    });
  }

  function handleConfirm() {
    const chosen = subtasks.filter((_, i) => selected.has(i));
    onAccept(chosen);
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">
          Découper cette tâche
        </h2>
        <p className="text-sm text-gray-500 mb-4">"{cardTitle}"</p>

        {subtasks.length === 0 && !loading && (
          <button
            onClick={generateBreakdown}
            className="w-full bg-gray-900 text-white rounded-lg py-2 text-sm font-medium"
          >
            Générer des sous-tâches
          </button>
        )}

        {loading && (
          <p className="text-sm text-gray-500 text-center py-4">
            Génération en cours…
          </p>
        )}

        {error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-lg p-3 mb-3">
            {error}
          </p>
        )}

        {subtasks.length > 0 && (
          <div className="space-y-2 mb-4 max-h-72 overflow-y-auto">
            {subtasks.map((task, i) => (
              <label
                key={i}
                className="flex items-start gap-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selected.has(i)}
                  onChange={() => toggle(i)}
                  className="mt-1"
                />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {task.title}
                  </p>
                  {task.description && (
                    <p className="text-xs text-gray-500">{task.description}</p>
                  )}
                </div>
              </label>
            ))}
          </div>
        )}

        <div className="flex gap-2 mt-2">
          <button
            onClick={onClose}
            className="flex-1 border border-gray-200 rounded-lg py-2 text-sm text-gray-700"
          >
            Annuler
          </button>
          {subtasks.length > 0 && (
            <button
              onClick={handleConfirm}
              disabled={selected.size === 0}
              className="flex-1 bg-gray-900 text-white rounded-lg py-2 text-sm font-medium disabled:opacity-40"
            >
              Ajouter {selected.size > 0 ? `(${selected.size})` : ""}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}