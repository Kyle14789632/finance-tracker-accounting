import type { TransactionType as PrismaTransactionType } from "../../prisma/generated/client";
import { Prisma } from "../../prisma/generated/client";
import type {
  BalanceSheet,
  BalanceSheetAsset,
  BalanceSheetEquityDefinition,
  BalanceSheetQuery,
  CategoryBreakdown,
  CategoryBreakdownItem,
  CategoryBreakdownQuery,
  IncomeStatement,
  IncomeStatementLineItem,
  IncomeStatementQuery,
  MonthlySummary,
  MonthlySummaryQuery
} from "@sft/shared";
import { AppError } from "../utils/app-error";
import { prisma } from "../utils/prisma";

const getMonthRangeUtc = (month: string): { start: Date; end: Date } => {
  const [yearPart, monthPart] = month.split("-");
  const year = Number(yearPart);
  const monthNumber = Number(monthPart);

  return {
    start: new Date(Date.UTC(year, monthNumber - 1, 1, 0, 0, 0, 0)),
    end: new Date(Date.UTC(year, monthNumber, 1, 0, 0, 0, 0))
  };
};

const getAsOfEndExclusiveUtc = (asOf: string): Date => {
  const [yearPart, monthPart, dayPart] = asOf.split("-");
  const year = Number(yearPart);
  const month = Number(monthPart);
  const day = Number(dayPart);

  return new Date(Date.UTC(year, month - 1, day + 1, 0, 0, 0, 0));
};

const asDecimal = (value: Prisma.Decimal | null | undefined): Prisma.Decimal => {
  return value ?? new Prisma.Decimal(0);
};

const toMoneyString = (value: Prisma.Decimal): string => value.toFixed(2);

const sumMoneyStrings = (values: string[]): Prisma.Decimal => {
  return values.reduce(
    (runningTotal, value) => runningTotal.plus(value),
    new Prisma.Decimal(0)
  );
};

type TotalsByType = {
  income: Prisma.Decimal;
  expense: Prisma.Decimal;
};

const getTotalsByType = async (
  userId: string,
  occurredAt: { gte?: Date; lt?: Date }
): Promise<TotalsByType> => {
  const grouped = await prisma.transaction.groupBy({
    by: ["type"],
    where: {
      userId,
      occurredAt
    },
    _sum: {
      amount: true
    }
  });

  const incomeRow = grouped.find((row) => row.type === "INCOME");
  const expenseRow = grouped.find((row) => row.type === "EXPENSE");

  return {
    income: asDecimal(incomeRow?._sum.amount),
    expense: asDecimal(expenseRow?._sum.amount)
  };
};

const getMonthlySummary = async (userId: string, query: MonthlySummaryQuery): Promise<MonthlySummary> => {
  const { start, end } = getMonthRangeUtc(query.month);
  const totalsByType = await getTotalsByType(userId, { gte: start, lt: end });
  const totalIncome = totalsByType.income;
  const totalExpense = totalsByType.expense;
  const net = totalIncome.minus(totalExpense);

  return {
    month: query.month,
    totalIncome: toMoneyString(totalIncome),
    totalExpense: toMoneyString(totalExpense),
    net: toMoneyString(net)
  };
};

const compareBreakdownItems = (a: CategoryBreakdownItem, b: CategoryBreakdownItem): number => {
  const amountComparison = new Prisma.Decimal(b.total).comparedTo(a.total);

  if (amountComparison !== 0) {
    return amountComparison;
  }

  return a.categoryName.localeCompare(b.categoryName);
};

const getBreakdownItems = async (
  userId: string,
  query: { month: string; type: PrismaTransactionType }
): Promise<IncomeStatementLineItem[]> => {
  const { start, end } = getMonthRangeUtc(query.month);
  const grouped = await prisma.transaction.groupBy({
    by: ["categoryId"],
    where: {
      userId,
      type: query.type,
      occurredAt: {
        gte: start,
        lt: end
      }
    },
    _sum: {
      amount: true
    }
  });

  if (grouped.length === 0) {
    return [];
  }

  const categoryIds = grouped.map((row) => row.categoryId);
  const categories = await prisma.category.findMany({
    where: {
      userId,
      id: {
        in: categoryIds
      }
    },
    select: {
      id: true,
      name: true
    }
  });
  const categoryNameById = new Map(categories.map((category) => [category.id, category.name]));

  const items = grouped.map((row) => {
    const amount = asDecimal(row._sum.amount);
    return {
      categoryId: row.categoryId,
      categoryName: categoryNameById.get(row.categoryId) ?? "Unknown category",
      total: toMoneyString(amount)
    } satisfies CategoryBreakdownItem;
  });

  items.sort(compareBreakdownItems);

  return items;
};

const getCategoryBreakdown = async (
  userId: string,
  query: CategoryBreakdownQuery
): Promise<CategoryBreakdown> => {
  const items = await getBreakdownItems(userId, {
    month: query.month,
    type: query.type as PrismaTransactionType
  });

  const total = items.reduce(
    (runningTotal, item) => runningTotal.plus(item.total),
    new Prisma.Decimal(0)
  );

  return {
    month: query.month,
    type: query.type,
    total: toMoneyString(total),
    categories: items
  };
};

const getIncomeStatement = async (
  userId: string,
  query: IncomeStatementQuery
): Promise<IncomeStatement> => {
  const [summary, breakdownIncome, breakdownExpenses] = await Promise.all([
    getMonthlySummary(userId, query),
    getBreakdownItems(userId, {
      month: query.month,
      type: "INCOME"
    }),
    getBreakdownItems(userId, {
      month: query.month,
      type: "EXPENSE"
    })
  ]);

  const totalIncome = sumMoneyStrings(breakdownIncome.map((item) => item.total));
  const totalExpenses = sumMoneyStrings(breakdownExpenses.map((item) => item.total));
  const netIncome = totalIncome.minus(totalExpenses);
  const summaryNet = new Prisma.Decimal(summary.net);

  if (!netIncome.equals(summaryNet)) {
    throw new AppError(
      500,
      "INCOME_STATEMENT_NET_MISMATCH",
      "Income statement net does not match monthly summary net",
      {
        month: query.month,
        monthlySummaryNet: toMoneyString(summaryNet),
        incomeStatementNet: toMoneyString(netIncome)
      }
    );
  }

  return {
    month: query.month,
    totalIncome: toMoneyString(totalIncome),
    totalExpenses: toMoneyString(totalExpenses),
    netIncome: toMoneyString(netIncome),
    breakdownIncome,
    breakdownExpenses
  };
};

const compareBalanceSheetAssets = (a: BalanceSheetAsset, b: BalanceSheetAsset): number => {
  const amountComparison = new Prisma.Decimal(b.balance).comparedTo(a.balance);

  if (amountComparison !== 0) {
    return amountComparison;
  }

  return a.accountName.localeCompare(b.accountName);
};

// Module 7 MVP decision: equity is cumulative net income up to and including `asOf` date.
const EQUITY_DEFINITION: BalanceSheetEquityDefinition = "CUMULATIVE_NET_INCOME_TO_DATE";

const getBalanceSheet = async (
  userId: string,
  query: BalanceSheetQuery
): Promise<BalanceSheet> => {
  const asOfEndExclusive = getAsOfEndExclusiveUtc(query.asOf);

  const [accounts, groupedByAccount, totalsByType] = await Promise.all([
    prisma.account.findMany({
      where: { userId },
      select: {
        id: true,
        name: true
      }
    }),
    prisma.transaction.groupBy({
      by: ["accountId", "type"],
      where: {
        userId,
        occurredAt: {
          lt: asOfEndExclusive
        }
      },
      _sum: {
        amount: true
      }
    }),
    getTotalsByType(userId, {
      lt: asOfEndExclusive
    })
  ]);

  const balanceByAccountId = new Map<string, Prisma.Decimal>(
    accounts.map((account) => [account.id, new Prisma.Decimal(0)])
  );

  for (const row of groupedByAccount) {
    const priorBalance = balanceByAccountId.get(row.accountId) ?? new Prisma.Decimal(0);
    const amount = asDecimal(row._sum.amount);
    const nextBalance = row.type === "INCOME"
      ? priorBalance.plus(amount)
      : priorBalance.minus(amount);
    balanceByAccountId.set(row.accountId, nextBalance);
  }

  const assets = accounts.map((account) => ({
    accountId: account.id,
    accountName: account.name,
    balance: toMoneyString(balanceByAccountId.get(account.id) ?? new Prisma.Decimal(0))
  }));
  assets.sort(compareBalanceSheetAssets);

  const totalAssets = sumMoneyStrings(assets.map((asset) => asset.balance));
  const equity = totalsByType.income.minus(totalsByType.expense);

  if (!totalAssets.equals(equity)) {
    throw new AppError(500, "BALANCE_SHEET_NOT_BALANCED", "Assets and equity are out of balance", {
      asOf: query.asOf,
      totalAssets: toMoneyString(totalAssets),
      equity: toMoneyString(equity),
      equityDefinition: EQUITY_DEFINITION
    });
  }

  return {
    asOf: query.asOf,
    assets,
    totalAssets: toMoneyString(totalAssets),
    equity: toMoneyString(equity),
    equityDefinition: EQUITY_DEFINITION
  };
};

export const reportService = {
  getMonthlySummary,
  getCategoryBreakdown,
  getIncomeStatement,
  getBalanceSheet
};
