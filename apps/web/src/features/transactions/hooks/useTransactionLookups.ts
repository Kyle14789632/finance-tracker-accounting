import type { Account, Category } from "@sft/shared";
import { useMemo } from "react";

type UseTransactionLookupsResult = {
  accountNameById: Map<string, string>;
  categoryById: Map<string, Category>;
};

export const useTransactionLookups = (
  accounts: Account[],
  categories: Category[],
): UseTransactionLookupsResult => {
  const accountNameById = useMemo(() => {
    return new Map(accounts.map((account) => [account.id, account.name]));
  }, [accounts]);

  const categoryById = useMemo(() => {
    return new Map(categories.map((category) => [category.id, category]));
  }, [categories]);

  return {
    accountNameById,
    categoryById,
  };
};
