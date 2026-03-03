import { z } from "zod";
import { moneyStringSchema, transactionTypeSchema } from "./schemas";

export const transactionFormSchema = z.object({
  accountId: z.string().uuid("Account is required"),
  categoryId: z.string().uuid("Category is required"),
  type: transactionTypeSchema,
  amount: moneyStringSchema,
  occurredAtLocal: z.string().min(1, "Occurred at date/time is required"),
  note: z.string().max(500, "Note must be at most 500 characters").optional(),
});

export type TransactionFormValues = z.infer<typeof transactionFormSchema>;

export const toDateTimeLocal = (isoString: string): string => {
  const date = new Date(isoString);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const pad = (value: number): string => value.toString().padStart(2, "0");

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}`;
};

export const getDefaultOccurredAtLocal = (): string => toDateTimeLocal(new Date().toISOString());

export const toIsoDateTime = (value: string): string | null => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString();
};
