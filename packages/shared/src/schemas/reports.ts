import { z } from "zod";
import { monthSchema, transactionTypeSchema } from "./transactions";

const decimalPattern = /^-?\d+(\.\d{1,2})?$/;
const nonNegativeDecimalPattern = /^\d+(\.\d{1,2})?$/;
const isoDatePattern = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;

const isValidIsoDate = (value: string): boolean => {
  if (!isoDatePattern.test(value)) {
    return false;
  }

  const [yearPart, monthPart, dayPart] = value.split("-");
  const year = Number(yearPart);
  const month = Number(monthPart);
  const day = Number(dayPart);
  const parsed = new Date(Date.UTC(year, month - 1, day));

  return (
    parsed.getUTCFullYear() === year &&
    parsed.getUTCMonth() === month - 1 &&
    parsed.getUTCDate() === day
  );
};

const signedMoneyStringSchema = z
  .string()
  .regex(decimalPattern, "Amount must be a decimal string with up to 2 decimal places");

const nonNegativeMoneyStringSchema = z
  .string()
  .regex(nonNegativeDecimalPattern, "Amount must be a non-negative decimal string with up to 2 decimal places");

export const asOfDateSchema = z
  .string()
  .regex(isoDatePattern, "Date must use YYYY-MM-DD format")
  .refine(isValidIsoDate, "Date must be a valid calendar date");

export const monthlySummaryQuerySchema = z
  .object({
    month: monthSchema
  })
  .strict();

export const monthlySummarySchema = z
  .object({
    month: monthSchema,
    totalIncome: nonNegativeMoneyStringSchema,
    totalExpense: nonNegativeMoneyStringSchema,
    net: signedMoneyStringSchema
  })
  .strict();

export const monthlySummaryResponseSchema = z
  .object({
    summary: monthlySummarySchema
  })
  .strict();

export const categoryBreakdownQuerySchema = z
  .object({
    month: monthSchema,
    type: transactionTypeSchema.default("EXPENSE")
  })
  .strict();

export const categoryBreakdownItemSchema = z
  .object({
    categoryId: z.string().uuid(),
    categoryName: z.string().min(1).max(100),
    total: nonNegativeMoneyStringSchema
  })
  .strict();

export const categoryBreakdownSchema = z
  .object({
    month: monthSchema,
    type: transactionTypeSchema,
    total: nonNegativeMoneyStringSchema,
    categories: z.array(categoryBreakdownItemSchema)
  })
  .strict();

export const categoryBreakdownResponseSchema = z
  .object({
    breakdown: categoryBreakdownSchema
  })
  .strict();

export const incomeStatementQuerySchema = z
  .object({
    month: monthSchema
  })
  .strict();

export const incomeStatementLineItemSchema = z
  .object({
    categoryId: z.string().uuid(),
    categoryName: z.string().min(1).max(100),
    total: nonNegativeMoneyStringSchema
  })
  .strict();

export const incomeStatementSchema = z
  .object({
    month: monthSchema,
    totalIncome: nonNegativeMoneyStringSchema,
    totalExpenses: nonNegativeMoneyStringSchema,
    netIncome: signedMoneyStringSchema,
    breakdownIncome: z.array(incomeStatementLineItemSchema),
    breakdownExpenses: z.array(incomeStatementLineItemSchema)
  })
  .strict();

export const incomeStatementResponseSchema = z
  .object({
    statement: incomeStatementSchema
  })
  .strict();

export const balanceSheetQuerySchema = z
  .object({
    asOf: asOfDateSchema
  })
  .strict();

export const balanceSheetAssetSchema = z
  .object({
    accountId: z.string().uuid(),
    accountName: z.string().min(1).max(100),
    balance: signedMoneyStringSchema
  })
  .strict();

export const balanceSheetEquityDefinitionSchema = z.literal("CUMULATIVE_NET_INCOME_TO_DATE");

export const balanceSheetSchema = z
  .object({
    asOf: asOfDateSchema,
    assets: z.array(balanceSheetAssetSchema),
    totalAssets: signedMoneyStringSchema,
    equity: signedMoneyStringSchema,
    equityDefinition: balanceSheetEquityDefinitionSchema
  })
  .strict();

export const balanceSheetResponseSchema = z
  .object({
    statement: balanceSheetSchema
  })
  .strict();

export type MonthlySummaryQuery = z.infer<typeof monthlySummaryQuerySchema>;
export type MonthlySummary = z.infer<typeof monthlySummarySchema>;
export type MonthlySummaryResponse = z.infer<typeof monthlySummaryResponseSchema>;
export type CategoryBreakdownQuery = z.infer<typeof categoryBreakdownQuerySchema>;
export type CategoryBreakdownItem = z.infer<typeof categoryBreakdownItemSchema>;
export type CategoryBreakdown = z.infer<typeof categoryBreakdownSchema>;
export type CategoryBreakdownResponse = z.infer<typeof categoryBreakdownResponseSchema>;
export type IncomeStatementQuery = z.infer<typeof incomeStatementQuerySchema>;
export type IncomeStatementLineItem = z.infer<typeof incomeStatementLineItemSchema>;
export type IncomeStatement = z.infer<typeof incomeStatementSchema>;
export type IncomeStatementResponse = z.infer<typeof incomeStatementResponseSchema>;
export type BalanceSheetQuery = z.infer<typeof balanceSheetQuerySchema>;
export type BalanceSheetAsset = z.infer<typeof balanceSheetAssetSchema>;
export type BalanceSheetEquityDefinition = z.infer<typeof balanceSheetEquityDefinitionSchema>;
export type BalanceSheet = z.infer<typeof balanceSheetSchema>;
export type BalanceSheetResponse = z.infer<typeof balanceSheetResponseSchema>;
