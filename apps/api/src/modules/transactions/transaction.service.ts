import {
  Prisma,
  type TransactionType as PrismaTransactionType,
} from "../../../prisma/generated/client";
import type {
  CreateTransactionRequest,
  JournalEntry,
  ListTransactionsQuery,
  Transaction,
  UpdateTransactionRequest,
} from "@sft/shared";
import { AppError } from "../../core/errors/app-error";
import { getMonthRangeUtc, parseOccurredAt } from "../../core/datetime/ranges";
import { toJournalEntry, toTransaction } from "./transaction.mapper";
import { journalService } from "./journal.service";
import {
  createTransactionRepository,
  type TransactionPersistenceInput,
  type TransactionRepository,
} from "./transaction.repository";

const normalizeNote = (note?: string): string | null => {
  if (!note) {
    return null;
  }

  const trimmed = note.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const findActiveAccountOrThrow = async (
  repository: TransactionRepository,
  userId: string,
  accountId: string,
) => {
  const account = await repository.findActiveAccountById(userId, accountId);

  if (!account) {
    throw new AppError(404, "ACCOUNT_NOT_FOUND", "Account not found");
  }

  return account;
};

const findActiveCategoryOrThrow = async (
  repository: TransactionRepository,
  userId: string,
  categoryId: string,
) => {
  const category = await repository.findActiveCategoryById(userId, categoryId);

  if (!category) {
    throw new AppError(404, "CATEGORY_NOT_FOUND", "Category not found");
  }

  return category;
};

const findTransactionOrThrow = async (
  repository: TransactionRepository,
  userId: string,
  transactionId: string,
) => {
  const transaction = await repository.findById(userId, transactionId);

  if (!transaction) {
    throw new AppError(404, "TRANSACTION_NOT_FOUND", "Transaction not found");
  }

  return transaction;
};

const toPersistencePayload = (
  payload: CreateTransactionRequest | UpdateTransactionRequest,
): TransactionPersistenceInput => ({
  accountId: payload.accountId,
  categoryId: payload.categoryId,
  type: payload.type as PrismaTransactionType,
  amount: new Prisma.Decimal(payload.amount),
  occurredAt: parseOccurredAt(payload.occurredAt),
  note: normalizeNote(payload.note),
});

export type TransactionService = {
  listTransactions: (userId: string, query: ListTransactionsQuery) => Promise<Transaction[]>;
  createTransaction: (userId: string, payload: CreateTransactionRequest) => Promise<Transaction>;
  updateTransaction: (
    userId: string,
    transactionId: string,
    payload: UpdateTransactionRequest,
  ) => Promise<Transaction>;
  deleteTransaction: (userId: string, transactionId: string) => Promise<Transaction>;
  getTransactionJournal: (userId: string, transactionId: string) => Promise<JournalEntry[]>;
};

type TransactionServiceDeps = {
  repository: TransactionRepository;
};

export const createTransactionService = ({
  repository,
}: TransactionServiceDeps): TransactionService => ({
  listTransactions: async (userId, query) => {
    const { start, end } = getMonthRangeUtc(query.month);
    const transactions = await repository.listByUser(userId, {
      accountId: query.accountId,
      categoryId: query.categoryId,
      type: query.type as PrismaTransactionType | undefined,
      occurredAt: { gte: start, lt: end },
    });

    return transactions.map(toTransaction);
  },

  createTransaction: async (userId, payload) => {
    const [account, category] = await Promise.all([
      findActiveAccountOrThrow(repository, userId, payload.accountId),
      findActiveCategoryOrThrow(repository, userId, payload.categoryId),
    ]);

    const persistencePayload = toPersistencePayload(payload);
    journalService.ensureCategoryMatchesType(category.type, persistencePayload.type);

    const journalLines = journalService.buildJournalLines(
      persistencePayload.type,
      persistencePayload.amount,
      account,
      category,
    );
    journalService.assertGeneratedJournal(journalLines);

    const transaction = await repository.createWithJournal(
      userId,
      persistencePayload,
      journalLines,
    );
    return toTransaction(transaction);
  },

  updateTransaction: async (userId, transactionId, payload) => {
    await findTransactionOrThrow(repository, userId, transactionId);

    const [account, category] = await Promise.all([
      findActiveAccountOrThrow(repository, userId, payload.accountId),
      findActiveCategoryOrThrow(repository, userId, payload.categoryId),
    ]);

    const persistencePayload = toPersistencePayload(payload);
    journalService.ensureCategoryMatchesType(category.type, persistencePayload.type);

    const journalLines = journalService.buildJournalLines(
      persistencePayload.type,
      persistencePayload.amount,
      account,
      category,
    );
    journalService.assertGeneratedJournal(journalLines);

    const transaction = await repository.updateWithJournal(
      userId,
      transactionId,
      persistencePayload,
      journalLines,
    );

    return toTransaction(transaction);
  },

  deleteTransaction: async (userId, transactionId) => {
    const existingTransaction = await findTransactionOrThrow(repository, userId, transactionId);
    await repository.deleteById(existingTransaction.id);
    return toTransaction(existingTransaction);
  },

  getTransactionJournal: async (userId, transactionId) => {
    await findTransactionOrThrow(repository, userId, transactionId);

    const journalEntries = await repository.listJournalEntries(userId, transactionId);
    const lines = journalEntries.map((entry) => ({
      side: entry.side,
      amount: new Prisma.Decimal(entry.amount),
    }));
    journalService.assertPersistedJournal(lines);

    return journalEntries.map(toJournalEntry);
  },
});

export const transactionService = createTransactionService({
  repository: createTransactionRepository(),
});
