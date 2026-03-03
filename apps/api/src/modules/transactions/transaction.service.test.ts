import assert from "node:assert/strict";
import { Prisma } from "../../../prisma/generated/client";
import type { Account, Category, Transaction } from "../../../prisma/generated/client";
import { AppError } from "../../core/errors/app-error";
import { runSuite } from "../../test/unit-test-utils";
import { createTransactionService } from "./transaction.service";
import type { JournalEntryRow, TransactionRepository } from "./transaction.repository";

const makeAccount = (overrides?: Partial<Account>): Account => ({
  id: "44444444-4444-4444-4444-444444444444",
  userId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
  name: "Main Bank",
  type: "BANK",
  isArchived: false,
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  ...overrides,
});

const makeCategory = (overrides?: Partial<Category>): Category => ({
  id: "55555555-5555-5555-5555-555555555555",
  userId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
  name: "Salary",
  type: "INCOME",
  isArchived: false,
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  ...overrides,
});

const makeTransaction = (overrides?: Partial<Transaction>): Transaction => ({
  id: "66666666-6666-6666-6666-666666666666",
  userId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
  accountId: "44444444-4444-4444-4444-444444444444",
  categoryId: "55555555-5555-5555-5555-555555555555",
  type: "INCOME",
  amount: new Prisma.Decimal("1200.00"),
  occurredAt: new Date("2026-01-15T00:00:00.000Z"),
  note: null,
  createdAt: new Date("2026-01-15T00:00:00.000Z"),
  updatedAt: new Date("2026-01-15T00:00:00.000Z"),
  ...overrides,
});

export const runTransactionServiceTests = async (): Promise<number> => {
  return runSuite("transactions.service", [
    {
      name: "create builds balanced journal entries",
      run: async () => {
        let capturedJournalLines:
          | Array<{ side: "DEBIT" | "CREDIT"; amount: Prisma.Decimal; accountType: string }>
          | undefined;

        const repository: TransactionRepository = {
          listByUser: async () => [],
          findById: async () => makeTransaction(),
          findActiveAccountById: async () => makeAccount(),
          findActiveCategoryById: async () => makeCategory(),
          createWithJournal: async (_userId, payload, journalLines) => {
            capturedJournalLines = journalLines;
            return makeTransaction({
              accountId: payload.accountId,
              categoryId: payload.categoryId,
              type: payload.type,
              amount: payload.amount,
              occurredAt: payload.occurredAt,
              note: payload.note,
            });
          },
          updateWithJournal: async () => makeTransaction(),
          deleteById: async () => makeTransaction(),
          listJournalEntries: async () => [],
        };

        const service = createTransactionService({ repository });
        const created = await service.createTransaction("user-id", {
          accountId: "44444444-4444-4444-4444-444444444444",
          categoryId: "55555555-5555-5555-5555-555555555555",
          type: "INCOME",
          amount: "1200.00",
          occurredAt: "2026-01-15T00:00:00.000Z",
        });

        assert.equal(created.amount, "1200.00");
        assert.ok(capturedJournalLines);
        assert.equal(capturedJournalLines.length, 2);
        assert.equal(capturedJournalLines[0].side, "DEBIT");
        assert.equal(capturedJournalLines[1].side, "CREDIT");
        assert.equal(
          capturedJournalLines[0].amount.plus(capturedJournalLines[1].amount.negated()).toFixed(2),
          "0.00",
        );
      },
    },
    {
      name: "journal retrieval fails on invalid line count",
      run: async () => {
        const singleJournalLine: JournalEntryRow = {
          id: "77777777-7777-7777-7777-777777777777",
          transactionId: "66666666-6666-6666-6666-666666666666",
          side: "DEBIT",
          accountType: "ASSET",
          accountRefId: "44444444-4444-4444-4444-444444444444",
          label: "Main Bank",
          amount: "100.00",
          createdAt: new Date("2026-01-15T00:00:00.000Z"),
        };

        const repository: TransactionRepository = {
          listByUser: async () => [],
          findById: async () => makeTransaction(),
          findActiveAccountById: async () => makeAccount(),
          findActiveCategoryById: async () => makeCategory(),
          createWithJournal: async () => makeTransaction(),
          updateWithJournal: async () => makeTransaction(),
          deleteById: async () => makeTransaction(),
          listJournalEntries: async () => [singleJournalLine],
        };

        const service = createTransactionService({ repository });

        await assert.rejects(
          () => service.getTransactionJournal("user-id", "66666666-6666-6666-6666-666666666666"),
          (error: unknown) => {
            assert.ok(error instanceof AppError);
            assert.equal(error.code, "INVALID_JOURNAL_LINE_COUNT");
            assert.equal(error.statusCode, 500);
            return true;
          },
        );
      },
    },
  ]);
};
