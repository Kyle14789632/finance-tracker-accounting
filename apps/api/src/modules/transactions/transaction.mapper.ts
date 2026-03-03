import { Prisma } from "../../../prisma/generated/client";
import type { JournalEntry, Transaction, TransactionType } from "@sft/shared";
import type { JournalEntryRow } from "./transaction.repository";

export const toTransaction = (transaction: {
  id: string;
  accountId: string;
  categoryId: string;
  type: string;
  amount: Prisma.Decimal;
  occurredAt: Date;
  note: string | null;
  createdAt: Date;
  updatedAt: Date;
}): Transaction => ({
  id: transaction.id,
  accountId: transaction.accountId,
  categoryId: transaction.categoryId,
  type: transaction.type as TransactionType,
  amount: transaction.amount.toFixed(2),
  occurredAt: transaction.occurredAt.toISOString(),
  note: transaction.note,
  createdAt: transaction.createdAt.toISOString(),
  updatedAt: transaction.updatedAt.toISOString(),
});

export const toJournalEntry = (entry: JournalEntryRow): JournalEntry => ({
  id: entry.id,
  transactionId: entry.transactionId,
  side: entry.side,
  accountType: entry.accountType,
  accountRefId: entry.accountRefId,
  label: entry.label,
  amount: new Prisma.Decimal(entry.amount).toFixed(2),
  createdAt: entry.createdAt.toISOString(),
});
