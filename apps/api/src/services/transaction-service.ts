import type {
  Account as AccountRecord,
  Category as CategoryRecord,
  CategoryType as PrismaCategoryType,
  Transaction as TransactionRecord,
  TransactionType as PrismaTransactionType
} from "../../prisma/generated/client";
import { Prisma } from "../../prisma/generated/client";
import { randomUUID } from "node:crypto";
import type {
  CreateTransactionRequest,
  JournalEntry,
  ListTransactionsQuery,
  Transaction,
  TransactionType,
  UpdateTransactionRequest
} from "@sft/shared";
import { AppError } from "../utils/app-error";
import { prisma } from "../utils/prisma";

const toTransaction = (transaction: TransactionRecord): Transaction => ({
  id: transaction.id,
  accountId: transaction.accountId,
  categoryId: transaction.categoryId,
  type: transaction.type as TransactionType,
  amount: transaction.amount.toFixed(2),
  occurredAt: transaction.occurredAt.toISOString(),
  note: transaction.note,
  createdAt: transaction.createdAt.toISOString(),
  updatedAt: transaction.updatedAt.toISOString()
});

type JournalEntryRow = {
  id: string;
  transactionId: string;
  side: JournalEntry["side"];
  accountType: JournalEntry["accountType"];
  accountRefId: string | null;
  label: string;
  amount: string;
  createdAt: Date;
};

const toJournalEntry = (entry: JournalEntryRow): JournalEntry => ({
  id: entry.id,
  transactionId: entry.transactionId,
  side: entry.side,
  accountType: entry.accountType,
  accountRefId: entry.accountRefId,
  label: entry.label,
  amount: new Prisma.Decimal(entry.amount).toFixed(2),
  createdAt: entry.createdAt.toISOString()
});

type JournalLineInput = {
  side: "DEBIT" | "CREDIT";
  accountType: "ASSET" | "REVENUE" | "EXPENSE";
  accountRefId: string | null;
  label: string;
  amount: Prisma.Decimal;
};

const normalizeNote = (note?: string): string | null => {
  if (!note) {
    return null;
  }

  const trimmed = note.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const parseOccurredAt = (occurredAt: string): Date => {
  const parsedDate = new Date(occurredAt);

  if (Number.isNaN(parsedDate.getTime())) {
    throw new AppError(400, "INVALID_OCCURRED_AT", "Occurred at must be a valid datetime");
  }

  return parsedDate;
};

const getMonthRangeUtc = (month: string): { start: Date; end: Date } => {
  const [yearPart, monthPart] = month.split("-");
  const year = Number(yearPart);
  const monthNumber = Number(monthPart);
  const start = new Date(Date.UTC(year, monthNumber - 1, 1, 0, 0, 0, 0));
  const end = new Date(Date.UTC(year, monthNumber, 1, 0, 0, 0, 0));

  return { start, end };
};

const ensureCategoryMatchesType = (
  categoryType: PrismaCategoryType,
  transactionType: PrismaTransactionType
): void => {
  if (categoryType !== transactionType) {
    throw new AppError(
      400,
      "CATEGORY_TYPE_MISMATCH",
      "Category type must match transaction type",
      {
        categoryType,
        transactionType
      }
    );
  }
};

const findActiveAccountOrThrow = async (userId: string, accountId: string): Promise<AccountRecord> => {
  const account = await prisma.account.findFirst({
    where: {
      id: accountId,
      userId,
      isArchived: false
    }
  });

  if (!account) {
    throw new AppError(404, "ACCOUNT_NOT_FOUND", "Account not found");
  }

  return account;
};

const findActiveCategoryOrThrow = async (
  userId: string,
  categoryId: string
): Promise<CategoryRecord> => {
  const category = await prisma.category.findFirst({
    where: {
      id: categoryId,
      userId,
      isArchived: false
    }
  });

  if (!category) {
    throw new AppError(404, "CATEGORY_NOT_FOUND", "Category not found");
  }

  return category;
};

const findTransactionOrThrow = async (
  userId: string,
  transactionId: string
): Promise<TransactionRecord> => {
  const transaction = await prisma.transaction.findFirst({
    where: {
      id: transactionId,
      userId
    }
  });

  if (!transaction) {
    throw new AppError(404, "TRANSACTION_NOT_FOUND", "Transaction not found");
  }

  return transaction;
};

const buildJournalLines = (
  transactionType: PrismaTransactionType,
  amount: Prisma.Decimal,
  account: AccountRecord,
  category: CategoryRecord
): JournalLineInput[] => {
  if (transactionType === "INCOME") {
    return [
      {
        side: "DEBIT",
        accountType: "ASSET",
        accountRefId: account.id,
        label: account.name,
        amount
      },
      {
        side: "CREDIT",
        accountType: "REVENUE",
        accountRefId: category.id,
        label: category.name,
        amount
      }
    ];
  }

  return [
    {
      side: "DEBIT",
      accountType: "EXPENSE",
      accountRefId: category.id,
      label: category.name,
      amount
    },
    {
      side: "CREDIT",
      accountType: "ASSET",
      accountRefId: account.id,
      label: account.name,
      amount
    }
  ];
};

const assertBalancedJournal = (lines: JournalLineInput[]): void => {
  const debitTotal = lines.reduce(
    (total, line) => (line.side === "DEBIT" ? total.plus(line.amount) : total),
    new Prisma.Decimal(0)
  );
  const creditTotal = lines.reduce(
    (total, line) => (line.side === "CREDIT" ? total.plus(line.amount) : total),
    new Prisma.Decimal(0)
  );

  if (!debitTotal.equals(creditTotal)) {
    throw new AppError(500, "JOURNAL_NOT_BALANCED", "Journal entries are not balanced", {
      debitTotal: debitTotal.toFixed(2),
      creditTotal: creditTotal.toFixed(2)
    });
  }
};

const createJournalEntries = async (
  tx: Prisma.TransactionClient,
  userId: string,
  transactionId: string,
  lines: JournalLineInput[]
): Promise<void> => {
  if (lines.length !== 2) {
    throw new AppError(
      500,
      "INVALID_JOURNAL_LINE_COUNT",
      "Journal generation must produce exactly 2 lines",
      { lineCount: lines.length }
    );
  }

  assertBalancedJournal(lines);

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

const listTransactions = async (
  userId: string,
  query: ListTransactionsQuery
): Promise<Transaction[]> => {
  const { start, end } = getMonthRangeUtc(query.month);
  const transactions = await prisma.transaction.findMany({
    where: {
      userId,
      accountId: query.accountId,
      categoryId: query.categoryId,
      type: query.type as PrismaTransactionType | undefined,
      occurredAt: {
        gte: start,
        lt: end
      }
    },
    orderBy: [{ occurredAt: "desc" }, { createdAt: "desc" }]
  });

  return transactions.map(toTransaction);
};

const createTransaction = async (
  userId: string,
  payload: CreateTransactionRequest
): Promise<Transaction> => {
  const [account, category] = await Promise.all([
    findActiveAccountOrThrow(userId, payload.accountId),
    findActiveCategoryOrThrow(userId, payload.categoryId)
  ]);

  const transactionType = payload.type as PrismaTransactionType;
  ensureCategoryMatchesType(category.type, transactionType);

  const transaction = await prisma.$transaction(async (tx) => {
    const createdTransaction = await tx.transaction.create({
      data: {
        userId,
        accountId: account.id,
        categoryId: category.id,
        type: transactionType,
        amount: new Prisma.Decimal(payload.amount),
        occurredAt: parseOccurredAt(payload.occurredAt),
        note: normalizeNote(payload.note)
      }
    });

    const journalLines = buildJournalLines(
      createdTransaction.type,
      createdTransaction.amount,
      account,
      category
    );
    await createJournalEntries(tx, userId, createdTransaction.id, journalLines);

    return createdTransaction;
  });

  return toTransaction(transaction);
};

const updateTransaction = async (
  userId: string,
  transactionId: string,
  payload: UpdateTransactionRequest
): Promise<Transaction> => {
  await findTransactionOrThrow(userId, transactionId);

  const [account, category] = await Promise.all([
    findActiveAccountOrThrow(userId, payload.accountId),
    findActiveCategoryOrThrow(userId, payload.categoryId)
  ]);

  const transactionType = payload.type as PrismaTransactionType;
  ensureCategoryMatchesType(category.type, transactionType);

  const updatedTransaction = await prisma.$transaction(async (tx) => {
    const nextTransaction = await tx.transaction.update({
      where: { id: transactionId },
      data: {
        accountId: account.id,
        categoryId: category.id,
        type: transactionType,
        amount: new Prisma.Decimal(payload.amount),
        occurredAt: parseOccurredAt(payload.occurredAt),
        note: normalizeNote(payload.note)
      }
    });

    await tx.$executeRaw`
      DELETE FROM "JournalEntry"
      WHERE "userId" = ${userId}::uuid
        AND "transactionId" = ${transactionId}::uuid
    `;

    const journalLines = buildJournalLines(nextTransaction.type, nextTransaction.amount, account, category);
    await createJournalEntries(tx, userId, transactionId, journalLines);

    return nextTransaction;
  });

  return toTransaction(updatedTransaction);
};

const deleteTransaction = async (userId: string, transactionId: string): Promise<Transaction> => {
  const transaction = await findTransactionOrThrow(userId, transactionId);

  await prisma.transaction.delete({
    where: { id: transaction.id }
  });

  return toTransaction(transaction);
};

const getTransactionJournal = async (userId: string, transactionId: string): Promise<JournalEntry[]> => {
  await findTransactionOrThrow(userId, transactionId);

  const journalEntries = await prisma.$queryRaw<JournalEntryRow[]>`
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
  `;

  if (journalEntries.length !== 2) {
    throw new AppError(
      500,
      "INVALID_JOURNAL_LINE_COUNT",
      "Journal entries must contain exactly 2 lines",
      { lineCount: journalEntries.length }
    );
  }

  const lines = journalEntries.map((entry) => ({
    side: entry.side,
    accountType: entry.accountType,
    accountRefId: entry.accountRefId,
    label: entry.label,
    amount: new Prisma.Decimal(entry.amount)
  }));
  assertBalancedJournal(lines);

  return journalEntries.map(toJournalEntry);
};

export const transactionService = {
  listTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getTransactionJournal
};
