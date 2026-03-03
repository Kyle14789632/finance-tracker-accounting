import type { Account, Category, TransactionType } from "@sft/shared";
import { useEffect, useMemo, useState } from "react";
import type { SelectMenuOption } from "../../../components/ui/SelectMenuField";
import { currentMonth } from "../constants";

type UseTransactionFiltersResult = {
  selectedMonth: string;
  selectedTypeFilter: "ALL" | TransactionType;
  selectedAccountFilter: string;
  selectedCategoryFilter: string;
  setSelectedMonth: (value: string) => void;
  setSelectedTypeFilter: (value: "ALL" | TransactionType) => void;
  setSelectedAccountFilter: (value: string) => void;
  setSelectedCategoryFilter: (value: string) => void;
  accountFilterOptions: SelectMenuOption[];
  categoryFilterOptions: SelectMenuOption[];
  queryFilters: {
    month: string;
    type?: TransactionType;
    accountId?: string;
    categoryId?: string;
  };
};

export const useTransactionFilters = (
  accounts: Account[],
  categories: Category[],
): UseTransactionFiltersResult => {
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<"ALL" | TransactionType>("ALL");
  const [selectedAccountFilter, setSelectedAccountFilter] = useState<string>("ALL");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>("ALL");

  const categoryOptionsForFilter = useMemo(() => {
    if (selectedTypeFilter === "ALL") {
      return categories;
    }

    return categories.filter((category) => category.type === selectedTypeFilter);
  }, [categories, selectedTypeFilter]);

  const accountFilterOptions = useMemo<SelectMenuOption[]>(() => {
    return [
      { value: "ALL", label: "All accounts" },
      ...accounts.map((account) => ({
        value: account.id,
        label: account.name,
      })),
    ];
  }, [accounts]);

  const categoryFilterOptions = useMemo<SelectMenuOption[]>(() => {
    return [
      { value: "ALL", label: "All categories" },
      ...categoryOptionsForFilter.map((category) => ({
        value: category.id,
        label: category.name,
      })),
    ];
  }, [categoryOptionsForFilter]);

  useEffect(() => {
    if (selectedCategoryFilter === "ALL") {
      return;
    }

    const selectedCategory = categories.find((category) => category.id === selectedCategoryFilter);

    if (!selectedCategory) {
      setSelectedCategoryFilter("ALL");
      return;
    }

    if (selectedTypeFilter !== "ALL" && selectedCategory.type !== selectedTypeFilter) {
      setSelectedCategoryFilter("ALL");
    }
  }, [categories, selectedCategoryFilter, selectedTypeFilter]);

  const queryFilters = useMemo(
    () => ({
      month: selectedMonth,
      type: selectedTypeFilter === "ALL" ? undefined : selectedTypeFilter,
      accountId: selectedAccountFilter === "ALL" ? undefined : selectedAccountFilter,
      categoryId: selectedCategoryFilter === "ALL" ? undefined : selectedCategoryFilter,
    }),
    [selectedAccountFilter, selectedCategoryFilter, selectedMonth, selectedTypeFilter],
  );

  return {
    selectedMonth,
    selectedTypeFilter,
    selectedAccountFilter,
    selectedCategoryFilter,
    setSelectedMonth,
    setSelectedTypeFilter,
    setSelectedAccountFilter,
    setSelectedCategoryFilter,
    accountFilterOptions,
    categoryFilterOptions,
    queryFilters,
  };
};
