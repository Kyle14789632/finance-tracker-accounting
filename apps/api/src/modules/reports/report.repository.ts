import {
  Prisma,
  type TransactionType as PrismaTransactionType,
} from "../../../prisma/generated/client";
import { prisma } from "../../core/db/prisma";

export type BreakdownGroupedRow = {
  categoryId: string;
  total: Prisma.Decimal;
};

export type AccountBalanceGroupedRow = {
  accountId: string;
  type: PrismaTransactionType;
  total: Prisma.Decimal;
};

export type ReportRepository = {
  getTotalsByType: (
    userId: string,
    occurredAt: { gte?: Date; lt?: Date },
  ) => Promise<{ income: Prisma.Decimal; expense: Prisma.Decimal }>;
  getBreakdownGroupedByCategory: (
    userId: string,
    query: { monthStart: Date; monthEnd: Date; type: PrismaTransactionType },
  ) => Promise<BreakdownGroupedRow[]>;
  getCategoryNamesByIds: (
    userId: string,
    categoryIds: string[],
  ) => Promise<Array<{ id: string; name: string }>>;
  getAccounts: (userId: string) => Promise<Array<{ id: string; name: string }>>;
  getAccountTypeSumsToDate: (
    userId: string,
    endExclusive: Date,
  ) => Promise<AccountBalanceGroupedRow[]>;
};

export const createReportRepository = (): ReportRepository => ({
  getTotalsByType: async (userId, occurredAt) => {
    const grouped = await prisma.transaction.groupBy({
      by: ["type"],
      where: {
        userId,
        occurredAt,
      },
      _sum: {
        amount: true,
      },
    });

    const incomeRow = grouped.find((row) => row.type === "INCOME");
    const expenseRow = grouped.find((row) => row.type === "EXPENSE");

    return {
      income: incomeRow?._sum.amount ?? new Prisma.Decimal(0),
      expense: expenseRow?._sum.amount ?? new Prisma.Decimal(0),
    };
  },

  getBreakdownGroupedByCategory: async (userId, query) => {
    const grouped = await prisma.transaction.groupBy({
      by: ["categoryId"],
      where: {
        userId,
        type: query.type,
        occurredAt: {
          gte: query.monthStart,
          lt: query.monthEnd,
        },
      },
      _sum: {
        amount: true,
      },
    });

    return grouped.map((row) => ({
      categoryId: row.categoryId,
      total: row._sum.amount ?? new Prisma.Decimal(0),
    }));
  },

  getCategoryNamesByIds: (userId, categoryIds) =>
    prisma.category.findMany({
      where: {
        userId,
        id: {
          in: categoryIds,
        },
      },
      select: {
        id: true,
        name: true,
      },
    }),

  getAccounts: (userId) =>
    prisma.account.findMany({
      where: { userId },
      select: {
        id: true,
        name: true,
      },
    }),

  getAccountTypeSumsToDate: async (userId, endExclusive) => {
    const grouped = await prisma.transaction.groupBy({
      by: ["accountId", "type"],
      where: {
        userId,
        occurredAt: {
          lt: endExclusive,
        },
      },
      _sum: {
        amount: true,
      },
    });

    return grouped.map((row) => ({
      accountId: row.accountId,
      type: row.type,
      total: row._sum.amount ?? new Prisma.Decimal(0),
    }));
  },
});
