"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Card as CardType } from "@/types/board";

type Props = {
  card: CardType;
  onBreakdown: (card: CardType) => void;
};

export function Card({ card, onBreakdown }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: card.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white rounded-lg p-3 shadow-sm border border-gray-200 cursor-grab active:cursor-grabbing group relative"
    >
      <p className="text-sm font-medium text-gray-900 pr-6">{card.title}</p>
      {card.description && (
        <p className="text-xs text-gray-500 mt-1">{card.description}</p>
      )}

      <button
        onClick={(e) => {
          e.stopPropagation();
          onBreakdown(card);
        }}
        onPointerDown={(e) => e.stopPropagation()}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-900 transition-opacity"
        aria-label="Découper cette tâche avec l'IA"
        title="Découper avec l'IA"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
        </svg>
      </button>
    </div>
  );
}