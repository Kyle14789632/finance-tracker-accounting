import type {
  Account,
  Category,
  CategoryType as PrismaCategoryType,
  TransactionType as PrismaTransactionType,
} from "../../../prisma/generated/client";
import { Prisma } from "../../../prisma/generated/client";
import { AppError } from "../../core/errors/app-error";

export type JournalLineInput = {
  side: "DEBIT" | "CREDIT";
  accountType: "ASSET" | "REVENUE" | "EXPENSE";
  accountRefId: string | null;
  label: string;
  amount: Prisma.Decimal;
};

const ensureCategoryMatchesType = (
  categoryType: PrismaCategoryType,
  transactionType: PrismaTransactionType,
): void => {
  if (categoryType !== transactionType) {
    throw new AppError(400, "CATEGORY_TYPE_MISMATCH", "Category type must match transaction type", {
      categoryType,
      transactionType,
    });
  }
};

const assertBalancedJournal = (
  lines: Array<{
    side: "DEBIT" | "CREDIT";
    amount: Prisma.Decimal;
  }>,
): void => {
  const debitTotal = lines.reduce(
    (total, line) => (line.side === "DEBIT" ? total.plus(line.amount) : total),
    new Prisma.Decimal(0),
  );
  const creditTotal = lines.reduce(
    (total, line) => (line.side === "CREDIT" ? total.plus(line.amount) : total),
    new Prisma.Decimal(0),
  );

  if (!debitTotal.equals(creditTotal)) {
    throw new AppError(500, "JOURNAL_NOT_BALANCED", "Journal entries are not balanced", {
      debitTotal: debitTotal.toFixed(2),
      creditTotal: creditTotal.toFixed(2),
    });
  }
};

const assertJournalLineCount = (lines: unknown[], expectedCount: number): void => {
  if (lines.length !== expectedCount) {
    throw new AppError(
      500,
      "INVALID_JOURNAL_LINE_COUNT",
      `Journal entries must contain exactly ${expectedCount} lines`,
      { lineCount: lines.length },
    );
  }
};

const buildJournalLines = (
  transactionType: PrismaTransactionType,
  amount: Prisma.Decimal,
  account: Pick<Account, "id" | "name">,
  category: Pick<Category, "id" | "name">,
): JournalLineInput[] => {
  if (transactionType === "INCOME") {
    return [
      {
        side: "DEBIT",
        accountType: "ASSET",
        accountRefId: account.id,
        label: account.name,
        amount,
      },
      {
        side: "CREDIT",
        accountType: "REVENUE",
        accountRefId: category.id,
        label: category.name,
        amount,
      },
    ];
  }

  return [
    {
      side: "DEBIT",
      accountType: "EXPENSE",
      accountRefId: category.id,
      label: category.name,
      amount,
    },
    {
      side: "CREDIT",
      accountType: "ASSET",
      accountRefId: account.id,
      label: account.name,
      amount,
    },
  ];
};

const assertGeneratedJournal = (lines: JournalLineInput[]): void => {
  assertJournalLineCount(lines, 2);
  assertBalancedJournal(lines);
};

const assertPersistedJournal = (
  lines: Array<{
    side: "DEBIT" | "CREDIT";
    amount: Prisma.Decimal;
  }>,
): void => {
  assertJournalLineCount(lines, 2);
  assertBalancedJournal(lines);
};

export const journalService = {
  ensureCategoryMatchesType,
  buildJournalLines,
  assertGeneratedJournal,
  assertPersistedJournal,
};
