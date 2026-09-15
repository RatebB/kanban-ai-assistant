"use client";

import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { Card } from "./Card";
import type { Column as ColumnType, Card as CardType } from "@/types/board";

type Props = {
  column: ColumnType;
  onBreakdown: (card: CardType) => void;
};

export function Column({ column, onBreakdown }: Props) {
  const { setNodeRef } = useDroppable({ id: column.id });
  const cardIds = column.cards.map((c) => c.id);

  return (
    <div className="bg-gray-100 rounded-xl p-3 w-72 flex-shrink-0">
      <h3 className="text-sm font-semibold text-gray-700 mb-3 px-1">
        {column.name}
        <span className="text-gray-400 font-normal ml-1">{column.cards.length}</span>
      </h3>

      <div ref={setNodeRef} className="flex flex-col gap-2 min-h-[40px]">
        <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
          {column.cards.map((card) => (
            <Card key={card.id} card={card} onBreakdown={onBreakdown} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}