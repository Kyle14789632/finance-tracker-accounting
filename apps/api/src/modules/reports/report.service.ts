import {
  Prisma,
  type TransactionType as PrismaTransactionType,
} from "../../../prisma/generated/client";
import type {
  BalanceSheet,
  BalanceSheetEquityDefinition,
  BalanceSheetQuery,
  CategoryBreakdown,
  CategoryBreakdownItem,
  CategoryBreakdownQuery,
  IncomeStatement,
  IncomeStatementLineItem,
  IncomeStatementQuery,
  MonthlySummary,
  MonthlySummaryQuery,
} from "@sft/shared";
import { getAsOfEndExclusiveUtc, getMonthRangeUtc } from "../../core/datetime/ranges";
import { AppError } from "../../core/errors/app-error";
import { sumMoneyStrings, toMoneyString } from "../../core/money/decimal";
import { compareBalanceSheetAssets, compareBreakdownItems } from "./report.mapper";
import { createReportRepository, type ReportRepository } from "./report.repository";

const getBreakdownItems = async (
  repository: ReportRepository,
  userId: string,
  query: { month: string; type: PrismaTransactionType },
): Promise<IncomeStatementLineItem[]> => {
  const { start, end } = getMonthRangeUtc(query.month);
  const grouped = await repository.getBreakdownGroupedByCategory(userId, {
    monthStart: start,
    monthEnd: end,
    type: query.type,
  });

  if (grouped.length === 0) {
    return [];
  }

  const categoryIds = grouped.map((row) => row.categoryId);
  const categories = await repository.getCategoryNamesByIds(userId, categoryIds);
  const categoryNameById = new Map(categories.map((category) => [category.id, category.name]));

  const items = grouped.map((row) => {
    return {
      categoryId: row.categoryId,
      categoryName: categoryNameById.get(row.categoryId) ?? "Unknown category",
      total: toMoneyString(row.total),
    } satisfies CategoryBreakdownItem;
  });

  items.sort(compareBreakdownItems);

  return items;
};

// Module 7 MVP decision: equity is cumulative net income up to and including `asOf` date.
const EQUITY_DEFINITION: BalanceSheetEquityDefinition = "CUMULATIVE_NET_INCOME_TO_DATE";

export type ReportService = {
  getMonthlySummary: (userId: string, query: MonthlySummaryQuery) => Promise<MonthlySummary>;
  getCategoryBreakdown: (
    userId: string,
    query: CategoryBreakdownQuery,
  ) => Promise<CategoryBreakdown>;
  getIncomeStatement: (userId: string, query: IncomeStatementQuery) => Promise<IncomeStatement>;
  getBalanceSheet: (userId: string, query: BalanceSheetQuery) => Promise<BalanceSheet>;
};

type ReportServiceDeps = {
  repository: ReportRepository;
};

export const createReportService = ({ repository }: ReportServiceDeps): ReportService => ({
  getMonthlySummary: async (userId, query) => {
    const { start, end } = getMonthRangeUtc(query.month);
    const totalsByType = await repository.getTotalsByType(userId, { gte: start, lt: end });
    const totalIncome = totalsByType.income;
    const totalExpense = totalsByType.expense;
    const net = totalIncome.minus(totalExpense);

    return {
      month: query.month,
      totalIncome: toMoneyString(totalIncome),
      totalExpense: toMoneyString(totalExpense),
      net: toMoneyString(net),
    };
  },

  getCategoryBreakdown: async (userId, query) => {
    const items = await getBreakdownItems(repository, userId, {
      month: query.month,
      type: query.type as PrismaTransactionType,
    });

    const total = items.reduce(
      (runningTotal, item) => runningTotal.plus(item.total),
      new Prisma.Decimal(0),
    );

    return {
      month: query.month,
      type: query.type,
      total: toMoneyString(total),
      categories: items,
    };
  },

  getIncomeStatement: async (userId, query) => {
    const getMonthlySummary = async (): Promise<MonthlySummary> => {
      const { start, end } = getMonthRangeUtc(query.month);
      const totalsByType = await repository.getTotalsByType(userId, { gte: start, lt: end });
      const totalIncome = totalsByType.income;
      const totalExpense = totalsByType.expense;
      const net = totalIncome.minus(totalExpense);

      return {
        month: query.month,
        totalIncome: toMoneyString(totalIncome),
        totalExpense: toMoneyString(totalExpense),
        net: toMoneyString(net),
      };
    };

    const [summary, breakdownIncome, breakdownExpenses] = await Promise.all([
      getMonthlySummary(),
      getBreakdownItems(repository, userId, {
        month: query.month,
        type: "INCOME",
      }),
      getBreakdownItems(repository, userId, {
        month: query.month,
        type: "EXPENSE",
      }),
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
          incomeStatementNet: toMoneyString(netIncome),
        },
      );
    }

    return {
      month: query.month,
      totalIncome: toMoneyString(totalIncome),
      totalExpenses: toMoneyString(totalExpenses),
      netIncome: toMoneyString(netIncome),
      breakdownIncome,
      breakdownExpenses,
    };
  },

  getBalanceSheet: async (userId, query) => {
    const asOfEndExclusive = getAsOfEndExclusiveUtc(query.asOf);

    const [accounts, groupedByAccount, totalsByType] = await Promise.all([
      repository.getAccounts(userId),
      repository.getAccountTypeSumsToDate(userId, asOfEndExclusive),
      repository.getTotalsByType(userId, {
        lt: asOfEndExclusive,
      }),
    ]);

    const balanceByAccountId = new Map<string, Prisma.Decimal>(
      accounts.map((account) => [account.id, new Prisma.Decimal(0)]),
    );

    for (const row of groupedByAccount) {
      const priorBalance = balanceByAccountId.get(row.accountId) ?? new Prisma.Decimal(0);
      const nextBalance =
        row.type === "INCOME" ? priorBalance.plus(row.total) : priorBalance.minus(row.total);
      balanceByAccountId.set(row.accountId, nextBalance);
    }

    const assets = accounts.map((account) => ({
      accountId: account.id,
      accountName: account.name,
      balance: toMoneyString(balanceByAccountId.get(account.id) ?? new Prisma.Decimal(0)),
    }));
    assets.sort(compareBalanceSheetAssets);

    const totalAssets = sumMoneyStrings(assets.map((asset) => asset.balance));
    const equity = totalsByType.income.minus(totalsByType.expense);

    if (!totalAssets.equals(equity)) {
      throw new AppError(
        500,
        "BALANCE_SHEET_NOT_BALANCED",
        "Assets and equity are out of balance",
        {
          asOf: query.asOf,
          totalAssets: toMoneyString(totalAssets),
          equity: toMoneyString(equity),
          equityDefinition: EQUITY_DEFINITION,
        },
      );
    }

    return {
      asOf: query.asOf,
      assets,
      totalAssets: toMoneyString(totalAssets),
      equity: toMoneyString(equity),
      equityDefinition: EQUITY_DEFINITION,
    };
  },
});

export const reportService = createReportService({
  repository: createReportRepository(),
});
