import type { CategoryType } from "@sft/shared";
import type { SelectMenuOption } from "../../components/ui/SelectMenuField";

export const categoryTypeLabel: Record<CategoryType, string> = {
  INCOME: "Income",
  EXPENSE: "Expense",
};

export const categoryTypeBadgeClass: Record<CategoryType, string> = {
  INCOME: "border border-sage-100 bg-sage-100/60 text-emerald-800",
  EXPENSE: "border border-primary-100 bg-primary-50 text-primary-700",
};

export const categoryTypeOptions: SelectMenuOption[] = [
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

export const categoryTypeFilterOptions: SelectMenuOption[] = [
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
