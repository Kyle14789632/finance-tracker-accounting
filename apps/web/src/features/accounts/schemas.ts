import { z } from "zod";

export const accountTypeSchema = z.enum(["CASH", "BANK", "SAVINGS"]);

export const accountSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  type: accountTypeSchema,
  isArchived: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
});

export const listAccountsQuerySchema = z
  .object({
    type: accountTypeSchema.optional()
  })
  .strict();

export const createAccountRequestSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required").max(100, "Name must be at most 100 characters"),
    type: accountTypeSchema
  })
  .strict();

export const updateAccountRequestSchema = createAccountRequestSchema;

export const listAccountsResponseSchema = z.object({
  accounts: z.array(accountSchema)
});

export const accountResponseSchema = z.object({
  account: accountSchema
});
