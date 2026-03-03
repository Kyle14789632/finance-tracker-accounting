import { useQuery } from "@tanstack/react-query";
import type { ListTransactionsQuery, TransactionType } from "@sft/shared";
import { getAccounts } from "../../accounts/api";
import { getCategories } from "../../categories/api";
import { getTransactionJournal, getTransactions } from "../api";
import { transactionsQueryKeys } from "../queryKeys";

type UseTransactionsQueryParams = {
  accessToken: string | null;
  selectedMonth: string;
  selectedTypeFilter: "ALL" | TransactionType;
  selectedAccountFilter: string;
  selectedCategoryFilter: string;
  queryFilters: ListTransactionsQuery;
};

type UseTransactionJournalQueryParams = {
  accessToken: string | null;
  learningModeEnabled: boolean;
  expandedTransactionId: string | null;
};

export const useTransactionAccountsQuery = (accessToken: string | null) => {
  return useQuery({
    queryKey: transactionsQueryKeys.lookupAccounts,
    enabled: Boolean(accessToken),
    queryFn: () => getAccounts(accessToken as string),
  });
};

export const useTransactionCategoriesQuery = (accessToken: string | null) => {
  return useQuery({
    queryKey: transactionsQueryKeys.lookupCategories,
    enabled: Boolean(accessToken),
    queryFn: () => getCategories(accessToken as string),
  });
};

export const useTransactionsQuery = ({
  accessToken,
  selectedMonth,
  selectedTypeFilter,
  selectedAccountFilter,
  selectedCategoryFilter,
  queryFilters,
}: UseTransactionsQueryParams) => {
  return useQuery({
    queryKey: transactionsQueryKeys.list({
      month: selectedMonth,
      typeFilter: selectedTypeFilter,
      accountFilter: selectedAccountFilter,
      categoryFilter: selectedCategoryFilter,
    }),
    enabled: Boolean(accessToken),
    queryFn: () => getTransactions(accessToken as string, queryFilters),
  });
};

export const useTransactionJournalQuery = ({
  accessToken,
  learningModeEnabled,
  expandedTransactionId,
}: UseTransactionJournalQueryParams) => {
  return useQuery({
    queryKey: transactionsQueryKeys.journal(expandedTransactionId),
    enabled: Boolean(accessToken) && learningModeEnabled && Boolean(expandedTransactionId),
    queryFn: () => getTransactionJournal(accessToken as string, expandedTransactionId as string),
  });
};
