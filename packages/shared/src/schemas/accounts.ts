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

export const accountParamsSchema = z
  .object({
    id: z.string().uuid("Account id must be a valid UUID")
  })
  .strict();

export const listAccountsResponseSchema = z.object({
  accounts: z.array(accountSchema)
});

export const accountResponseSchema = z.object({
  account: accountSchema
});

export type AccountType = z.infer<typeof accountTypeSchema>;
export type Account = z.infer<typeof accountSchema>;
export type ListAccountsQuery = z.infer<typeof listAccountsQuerySchema>;
export type CreateAccountRequest = z.infer<typeof createAccountRequestSchema>;
export type UpdateAccountRequest = z.infer<typeof updateAccountRequestSchema>;
export type AccountParams = z.infer<typeof accountParamsSchema>;
export type ListAccountsResponse = z.infer<typeof listAccountsResponseSchema>;
export type AccountResponse = z.infer<typeof accountResponseSchema>;
