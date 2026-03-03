import type { TransactionType } from "@sft/shared";

type TransactionsListKeyParams = {
  month: string;
  typeFilter: "ALL" | TransactionType;
  accountFilter: string;
  categoryFilter: string;
};

export const transactionsQueryKeys = {
  all: ["transactions"] as const,
  list: ({ month, typeFilter, accountFilter, categoryFilter }: TransactionsListKeyParams) =>
    ["transactions", month, typeFilter, accountFilter, categoryFilter] as const,
  journal: (transactionId: string | null) => ["transactions", "journal", transactionId] as const,
  lookupAccounts: ["accounts", "transactions"] as const,
  lookupCategories: ["categories", "transactions"] as const,
};
