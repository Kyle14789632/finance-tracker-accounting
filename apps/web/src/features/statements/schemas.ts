import { z } from "zod";

const monthPattern = /^\d{4}-(0[1-9]|1[0-2])$/;
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

const asOfDateSchema = z
  .string()
  .regex(isoDatePattern, "Date must use YYYY-MM-DD format")
  .refine(isValidIsoDate, "Date must be a valid calendar date");

export const incomeStatementQuerySchema = z
  .object({
    month: z.string().regex(monthPattern, "Month must use YYYY-MM format")
  })
  .strict();

export const incomeStatementResponseSchema = z
  .object({
    statement: z
      .object({
        month: z.string().regex(monthPattern, "Month must use YYYY-MM format"),
        totalIncome: nonNegativeMoneyStringSchema,
        totalExpenses: nonNegativeMoneyStringSchema,
        netIncome: signedMoneyStringSchema,
        breakdownIncome: z.array(
          z
            .object({
              categoryId: z.string().uuid(),
              categoryName: z.string().min(1).max(100),
              total: nonNegativeMoneyStringSchema
            })
            .strict()
        ),
        breakdownExpenses: z.array(
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

export const balanceSheetQuerySchema = z
  .object({
    asOf: asOfDateSchema
  })
  .strict();

export const balanceSheetResponseSchema = z
  .object({
    statement: z
      .object({
        asOf: asOfDateSchema,
        assets: z.array(
          z
            .object({
              accountId: z.string().uuid(),
              accountName: z.string().min(1).max(100),
              balance: signedMoneyStringSchema
            })
            .strict()
        ),
        totalAssets: signedMoneyStringSchema,
        equity: signedMoneyStringSchema,
        equityDefinition: z.literal("CUMULATIVE_NET_INCOME_TO_DATE")
      })
      .strict()
  })
  .strict();
