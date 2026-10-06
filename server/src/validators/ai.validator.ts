import { z } from "zod";

export const assistantQuerySchema = z.object({
  query: z
    .string()
    .trim()
    .min(2, "আরেকটু বিস্তারিত লিখুন")
    .max(300, "প্রশ্নটি অনেক লম্বা"),
});

export type AssistantQueryInput = z.infer<typeof assistantQuerySchema>;