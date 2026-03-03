import type { JournalEntry, TransactionType } from "@sft/shared";
import type { SelectMenuOption } from "../../components/ui/SelectMenuField";

export const transactionTypeLabel: Record<TransactionType, string> = {
  INCOME: "Income",
  EXPENSE: "Expense",
};

export const transactionTypeBadgeClass: Record<TransactionType, string> = {
  INCOME: "border border-sage-100 bg-sage-100/60 text-emerald-800",
  EXPENSE: "border border-primary-100 bg-primary-50 text-primary-700",
};

export const journalSideLabel: Record<JournalEntry["side"], string> = {
  DEBIT: "Debit",
  CREDIT: "Credit",
};

export const journalAccountTypeLabel: Record<JournalEntry["accountType"], string> = {
  ASSET: "Asset",
  REVENUE: "Revenue",
  EXPENSE: "Expense",
};

export const modalTransactionTypeOptions: SelectMenuOption[] = [
  {
    value: "INCOME",
    label: "Income",
    helperText: "Money received",
  },
  {
    value: "EXPENSE",
    label: "Expense",
    helperText: "Money spent",
  },
];

export const transactionFilterTypeOptions: SelectMenuOption[] = [
  {
    value: "ALL",
    label: "All types",
  },
  {
    value: "INCOME",
    label: "Income only",
  },
  {
    value: "EXPENSE",
    label: "Expense only",
  },
];

export const currentMonth = new Date().toISOString().slice(0, 7);
