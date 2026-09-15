"use client";

import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import { Column } from "./Column";
import { Card } from "./Card";
import { BreakdownModal } from "./BreakdownModal";
import type { Board as BoardType, Card as CardType } from "@/types/board";
import type { Subtask } from "@/lib/schemas";

export function Board({ initialBoard }: { initialBoard: BoardType }) {
  const [board, setBoard] = useState(initialBoard);
  const [activeCard, setActiveCard] = useState<CardType | null>(null);
  const [breakdownTarget, setBreakdownTarget] = useState<CardType | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  function findColumnByCardId(cardId: string) {
    return board.columns.find((col) => col.cards.some((c) => c.id === cardId));
  }

  function handleDragStart(event: DragStartEvent) {
    const cardId = event.active.id as string;
    const column = findColumnByCardId(cardId);
    const card = column?.cards.find((c) => c.id === cardId) ?? null;
    setActiveCard(card);
  }

  function handleDragEnd(event: DragEndEvent) {
  const { active, over } = event;
  setActiveCard(null);
  if (!over) return;

  const activeId = active.id as string;
  const overId = over.id as string;
  if (activeId === overId) return;

  const sourceColumn = findColumnByCardId(activeId);
  const targetColumn =
    findColumnByCardId(overId) ?? board.columns.find((col) => col.id === overId);

  if (!sourceColumn || !targetColumn) return;

  let finalSourceCardIds: string[] = [];
  let finalTargetCardIds: string[] = [];

  setBoard((prev) => {
    const newColumns = prev.columns.map((col) => ({ ...col, cards: [...col.cards] }));
    const source = newColumns.find((c) => c.id === sourceColumn.id)!;
    const target = newColumns.find((c) => c.id === targetColumn.id)!;

    const cardIndex = source.cards.findIndex((c) => c.id === activeId);
    const [movedCard] = source.cards.splice(cardIndex, 1);

    const overIndex = target.cards.findIndex((c) => c.id === overId);
    const insertIndex = overIndex >= 0 ? overIndex : target.cards.length;
    target.cards.splice(insertIndex, 0, movedCard);

    finalSourceCardIds = source.cards.map((c) => c.id);
    finalTargetCardIds = target.cards.map((c) => c.id);

    return { ...prev, columns: newColumns };
  });

  fetch("/api/cards/move", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sourceColumnId: sourceColumn.id,
      targetColumnId: targetColumn.id,
      sourceCardIds: finalSourceCardIds,
      targetCardIds: finalTargetCardIds,
    }),
  }).catch((err) => console.error("Erreur de persistance:", err));
}

  async function handleAcceptSubtasks(subtasks: Subtask[]) {
    if (!breakdownTarget) return;

    const column = findColumnByCardId(breakdownTarget.id);
    if (!column) return;

    const res = await fetch("/api/cards/create-batch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ columnId: column.id, subtasks }),
    });

    if (!res.ok) {
      console.error("Erreur lors de la création des sous-tâches");
      return;
    }

    const { cards: createdCards } = await res.json();

    setBoard((prev) => ({
      ...prev,
      columns: prev.columns.map((col) =>
        col.id === column.id
          ? {
              ...col,
              cards: [
                ...col.cards,
                ...createdCards.map((c: { id: string; title: string; description: string | null }) => ({
                  id: c.id,
                  title: c.title,
                  description: c.description ?? undefined,
                })),
              ],
            }
          : col
      ),
    }));
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto p-6">
        {board.columns.map((column) => (
          <Column key={column.id} column={column} onBreakdown={setBreakdownTarget} />
        ))}
      </div>

      <DragOverlay>{activeCard ? <Card card={activeCard} onBreakdown={() => {}} /> : null}</DragOverlay>

      {breakdownTarget && (
        <BreakdownModal
          cardTitle={breakdownTarget.title}
          onClose={() => setBreakdownTarget(null)}
          onAccept={handleAcceptSubtasks}
        />
      )}
    </DndContext>
  );
}