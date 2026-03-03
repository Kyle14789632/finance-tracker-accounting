import { randomUUID } from "node:crypto";
import type {
  Account,
  Category,
  Prisma,
  Transaction,
  TransactionType as PrismaTransactionType,
} from "../../../prisma/generated/client";
import { prisma } from "../../core/db/prisma";
import type { JournalLineInput } from "./journal.service";

export type ListTransactionsFilters = {
  accountId?: string;
  categoryId?: string;
  type?: PrismaTransactionType;
  occurredAt: {
    gte: Date;
    lt: Date;
  };
};

export type TransactionPersistenceInput = {
  accountId: string;
  categoryId: string;
  type: PrismaTransactionType;
  amount: Prisma.Decimal;
  occurredAt: Date;
  note: string | null;
};

export type JournalEntryRow = {
  id: string;
  transactionId: string;
  side: "DEBIT" | "CREDIT";
  accountType: "ASSET" | "REVENUE" | "EXPENSE";
  accountRefId: string | null;
  label: string;
  amount: string;
  createdAt: Date;
};

type JournalQueryRow = JournalEntryRow;

export type TransactionRepository = {
  listByUser: (userId: string, filters: ListTransactionsFilters) => Promise<Transaction[]>;
  findById: (userId: string, transactionId: string) => Promise<Transaction | null>;
  findActiveAccountById: (userId: string, accountId: string) => Promise<Account | null>;
  findActiveCategoryById: (userId: string, categoryId: string) => Promise<Category | null>;
  createWithJournal: (
    userId: string,
    payload: TransactionPersistenceInput,
    journalLines: JournalLineInput[],
  ) => Promise<Transaction>;
  updateWithJournal: (
    userId: string,
    transactionId: string,
    payload: TransactionPersistenceInput,
    journalLines: JournalLineInput[],
  ) => Promise<Transaction>;
  deleteById: (transactionId: string) => Promise<Transaction>;
  listJournalEntries: (userId: string, transactionId: string) => Promise<JournalEntryRow[]>;
};

const insertJournalLines = async (
  tx: Prisma.TransactionClient,
  userId: string,
  transactionId: string,
  lines: JournalLineInput[],
): Promise<void> => {
  for (const line of lines) {
    await tx.$executeRaw`
      INSERT INTO "JournalEntry" (
        "id",
        "userId",
        "transactionId",
        "side",
        "accountType",
        "accountRefId",
        "label",
        "amount"
      )
      VALUES (
        ${randomUUID()}::uuid,
        ${userId}::uuid,
        ${transactionId}::uuid,
        ${line.side}::"JournalSide",
        ${line.accountType}::"JournalAccountType",
        ${line.accountRefId}::uuid,
        ${line.label},
        ${line.amount.toFixed(2)}::DECIMAL(12,2)
      )
    `;
  }
};

export const createTransactionRepository = (): TransactionRepository => ({
  listByUser: (userId, filters) =>
    prisma.transaction.findMany({
      where: {
        userId,
        accountId: filters.accountId,
        categoryId: filters.categoryId,
        type: filters.type,
        occurredAt: filters.occurredAt,
      },
      orderBy: [{ occurredAt: "desc" }, { createdAt: "desc" }],
    }),

  findById: (userId, transactionId) =>
    prisma.transaction.findFirst({
      where: {
        id: transactionId,
        userId,
      },
    }),

  findActiveAccountById: (userId, accountId) =>
    prisma.account.findFirst({
      where: {
        id: accountId,
        userId,
        isArchived: false,
      },
    }),

  findActiveCategoryById: (userId, categoryId) =>
    prisma.category.findFirst({
      where: {
        id: categoryId,
        userId,
        isArchived: false,
      },
    }),

  createWithJournal: (userId, payload, journalLines) =>
    prisma.$transaction(async (tx) => {
      const transaction = await tx.transaction.create({
        data: {
          userId,
          accountId: payload.accountId,
          categoryId: payload.categoryId,
          type: payload.type,
          amount: payload.amount,
          occurredAt: payload.occurredAt,
          note: payload.note,
        },
      });

      await insertJournalLines(tx, userId, transaction.id, journalLines);

      return transaction;
    }),

  updateWithJournal: (userId, transactionId, payload, journalLines) =>
    prisma.$transaction(async (tx) => {
      const transaction = await tx.transaction.update({
        where: { id: transactionId },
        data: {
          accountId: payload.accountId,
          categoryId: payload.categoryId,
          type: payload.type,
          amount: payload.amount,
          occurredAt: payload.occurredAt,
          note: payload.note,
        },
      });

      await tx.$executeRaw`
        DELETE FROM "JournalEntry"
        WHERE "userId" = ${userId}::uuid
          AND "transactionId" = ${transactionId}::uuid
      `;

      await insertJournalLines(tx, userId, transactionId, journalLines);

      return transaction;
    }),

  deleteById: (transactionId) =>
    prisma.transaction.delete({
      where: { id: transactionId },
    }),

  listJournalEntries: (userId, transactionId) =>
    prisma.$queryRaw<JournalQueryRow[]>`
      SELECT
        "id",
        "transactionId",
        "side",
        "accountType",
        "accountRefId",
        "label",
        "amount"::text AS "amount",
        "createdAt"
      FROM "JournalEntry"
      WHERE "userId" = ${userId}::uuid
        AND "transactionId" = ${transactionId}::uuid
      ORDER BY
        CASE WHEN "side" = 'DEBIT' THEN 0 ELSE 1 END ASC,
        "createdAt" ASC,
        "id" ASC
    `,
});
