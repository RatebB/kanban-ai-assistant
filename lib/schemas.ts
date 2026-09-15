import { z } from "zod";

export const subtaskSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().max(200).optional(),
});

export const breakdownResponseSchema = z.object({
  subtasks: z.array(subtaskSchema).min(2).max(8),
});

export type Subtask = z.infer<typeof subtaskSchema>;
export type BreakdownResponse = z.infer<typeof breakdownResponseSchema>;