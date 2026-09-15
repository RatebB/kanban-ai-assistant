export type Card = {
  id: string;
  title: string;
  description?: string;
};

export type Column = {
  id: string;
  name: string;
  cards: Card[];
};

export type Board = {
  id: string;
  name: string;
  columns: Column[];
};