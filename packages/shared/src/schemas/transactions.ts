import { z } from "zod";

const monthPattern = /^\d{4}-(0[1-9]|1[0-2])$/;
const moneyPattern = /^\d{1,10}(\.\d{1,2})?$/;

const isPositiveMoneyString = (value: string): boolean => {
  if (!moneyPattern.test(value)) {
    return false;
  }

  const [wholePart, decimalPart = ""] = value.split(".");
  const cents = BigInt(wholePart) * 100n + BigInt((decimalPart + "00").slice(0, 2));

  return cents > 0n;
};

export const transactionTypeSchema = z.enum(["INCOME", "EXPENSE"]);
export const journalSideSchema = z.enum(["DEBIT", "CREDIT"]);
export const journalAccountTypeSchema = z.enum(["ASSET", "REVENUE", "EXPENSE"]);

export const monthSchema = z
  .string()
  .regex(monthPattern, "Month must use YYYY-MM format");

export const moneyStringSchema = z
  .string()
  .regex(moneyPattern, "Amount must be a decimal string with up to 2 decimal places")
  .refine(isPositiveMoneyString, "Amount must be greater than 0");

export const transactionSchema = z.object({
  id: z.string().uuid(),
  accountId: z.string().uuid(),
  categoryId: z.string().uuid(),
  type: transactionTypeSchema,
  amount: moneyStringSchema,
  occurredAt: z.string().datetime(),
  note: z.string().max(500).nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
});

export const journalEntrySchema = z.object({
  id: z.string().uuid(),
  transactionId: z.string().uuid(),
  side: journalSideSchema,
  accountType: journalAccountTypeSchema,
  accountRefId: z.string().uuid().nullable(),
  label: z.string().min(1).max(255),
  amount: moneyStringSchema,
  createdAt: z.string().datetime()
});

export const listTransactionsQuerySchema = z
  .object({
    month: monthSchema,
    accountId: z.string().uuid("Account id must be a valid UUID").optional(),
    categoryId: z.string().uuid("Category id must be a valid UUID").optional(),
    type: transactionTypeSchema.optional()
  })
  .strict();

export const createTransactionRequestSchema = z
  .object({
    accountId: z.string().uuid("Account id must be a valid UUID"),
    categoryId: z.string().uuid("Category id must be a valid UUID"),
    type: transactionTypeSchema,
    amount: moneyStringSchema,
    occurredAt: z.string().datetime("Occurred at must be a valid ISO datetime"),
    note: z
      .string()
      .trim()
      .max(500, "Note must be at most 500 characters")
      .optional()
  })
  .strict();

export const updateTransactionRequestSchema = createTransactionRequestSchema;

export const transactionParamsSchema = z
  .object({
    id: z.string().uuid("Transaction id must be a valid UUID")
  })
  .strict();

export const listTransactionsResponseSchema = z.object({
  transactions: z.array(transactionSchema)
});

export const transactionResponseSchema = z.object({
  transaction: transactionSchema
});

export const journalEntriesResponseSchema = z.object({
  journalEntries: z.array(journalEntrySchema)
});

export type TransactionType = z.infer<typeof transactionTypeSchema>;
export type JournalSide = z.infer<typeof journalSideSchema>;
export type JournalAccountType = z.infer<typeof journalAccountTypeSchema>;
export type Transaction = z.infer<typeof transactionSchema>;
export type JournalEntry = z.infer<typeof journalEntrySchema>;
export type ListTransactionsQuery = z.infer<typeof listTransactionsQuerySchema>;
export type CreateTransactionRequest = z.infer<typeof createTransactionRequestSchema>;
export type UpdateTransactionRequest = z.infer<typeof updateTransactionRequestSchema>;
export type TransactionParams = z.infer<typeof transactionParamsSchema>;
export type ListTransactionsResponse = z.infer<typeof listTransactionsResponseSchema>;
export type TransactionResponse = z.infer<typeof transactionResponseSchema>;
export type JournalEntriesResponse = z.infer<typeof journalEntriesResponseSchema>;
