"use client";

import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { Card } from "./Card";
import type { Column as ColumnType, Card as CardType } from "@/types/board";
import { AddCardButton } from "./AddCardButton";
type Props = {
  column: ColumnType;
  onBreakdown: (card: CardType) => void;
  onCardAdded: (column_id: string, card: CardType) => void
};

export function Column({ column, onCardAdded,  onBreakdown }: Props) {
  const { setNodeRef } = useDroppable({ id: column.id });
  const cardIds = column.cards.map((c) => c.id);

  return (
   <div className="bg-white/60 rounded-lg p-3 w-72 flex-shrink-0 border border-[#E5E3DD]">
  <div className="flex items-baseline justify-between mb-3 px-1">
    <h3 className="text-[13px] font-semibold text-[#1A1A17] tracking-tight">
        {column.name}
        <span className="text-[11px] text-[#5B5850] font-normal">
      {column.cards.length}
    </span>
      </h3>
</div>
      <div ref={setNodeRef} className="flex flex-col gap-2 min-h-[40px]">
        <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
          {column.cards.map((card) => (
            <Card key={card.id} card={card} onBreakdown={onBreakdown} />
          ))}
        </SortableContext>
        <AddCardButton
            columnId={column.id}
            onCardCreated={(card) => onCardAdded(column.id, card)}
        />
      </div>
    </div>
     
  );
}