"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Card as CardType } from "@/types/board";

type Props = {
  card: CardType;
  onBreakdown: (card: CardType) => void;
  onDelete: (cardId: string) => void;
};

export function Card({ card, onBreakdown, onDelete  }: Props) {
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
      className="bg-white rounded-md p-3 border border-[#E5E3DD] cursor-grab active:cursor-grabbing group relative hover:border-[#3D5A4C]/30 transition-colors"
    >
      <p className="text-[13px] font-medium text-[#1A1A17] pr-6 leading-snug">{card.title}</p>
      {card.description && (
        <p className="text-[12px] text-[#5B5850] mt-1 leading-snug">{card.description}</p>
      )}

      <button
        onClick={(e) => {
          e.stopPropagation();
          onBreakdown(card);
        }}
        onPointerDown={(e) => e.stopPropagation()}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-[#C4634A] hover:text-[#a34f3a] transition-opacity"
    aria-label="Découper cette tâche avec l'IA"
    title="Découper avec l'IA"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
        </svg>
      </button>
      <button
          onClick={(e) => {
            e.stopPropagation();
            if (confirm(`Supprimer "${card.title}" ?`)) {
              onDelete(card.id);
            }
          }}
          onPointerDown={(e) => e.stopPropagation()}
          className="text-[#5B5850] hover:text-red-600"
          aria-label="Supprimer cette carte"
          title="Supprimer"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z" />
          </svg>
        </button>
    </div>
  );
}