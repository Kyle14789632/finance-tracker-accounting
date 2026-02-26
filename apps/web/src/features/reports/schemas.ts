import { z } from "zod";

const monthPattern = /^\d{4}-(0[1-9]|1[0-2])$/;
const decimalPattern = /^-?\d+(\.\d{1,2})?$/;
const nonNegativeDecimalPattern = /^\d+(\.\d{1,2})?$/;

const signedMoneyStringSchema = z
  .string()
  .regex(decimalPattern, "Amount must be a decimal string with up to 2 decimal places");

const nonNegativeMoneyStringSchema = z
  .string()
  .regex(nonNegativeDecimalPattern, "Amount must be a non-negative decimal string with up to 2 decimal places");

const transactionTypeSchema = z.enum(["INCOME", "EXPENSE"]);

export const monthlySummaryQuerySchema = z
  .object({
    month: z.string().regex(monthPattern, "Month must use YYYY-MM format")
  })
  .strict();

export const monthlySummaryResponseSchema = z
  .object({
    summary: z
      .object({
        month: z.string().regex(monthPattern, "Month must use YYYY-MM format"),
        totalIncome: nonNegativeMoneyStringSchema,
        totalExpense: nonNegativeMoneyStringSchema,
        net: signedMoneyStringSchema
      })
      .strict()
  })
  .strict();

export const categoryBreakdownQuerySchema = z
  .object({
    month: z.string().regex(monthPattern, "Month must use YYYY-MM format"),
    type: transactionTypeSchema.default("EXPENSE")
  })
  .strict();

export const categoryBreakdownResponseSchema = z
  .object({
    breakdown: z
      .object({
        month: z.string().regex(monthPattern, "Month must use YYYY-MM format"),
        type: transactionTypeSchema,
        total: nonNegativeMoneyStringSchema,
        categories: z.array(
          z
            .object({
              categoryId: z.string().uuid(),
              categoryName: z.string().min(1).max(100),
              total: nonNegativeMoneyStringSchema
            })
            .strict()
        )
      })
      .strict()
  })
  .strict();
