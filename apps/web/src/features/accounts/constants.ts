import type { AccountType } from "@sft/shared";
import type { SelectMenuOption } from "../../components/ui/SelectMenuField";

export const accountTypeLabel: Record<AccountType, string> = {
  CASH: "Cash",
  BANK: "Bank",
  SAVINGS: "Savings",
};

export const accountTypeBadgeClass: Record<AccountType, string> = {
  CASH: "border border-primary-100 bg-primary-50 text-primary-700",
  BANK: "border border-slate-200 bg-slate-100 text-slate-700",
  SAVINGS: "border border-sage-100 bg-sage-100/60 text-emerald-800",
};

export const accountTypeOptions: SelectMenuOption[] = [
  {
    value: "CASH",
    label: "Cash",
    helperText: "Physical cash",
  },
  {
    value: "BANK",
    label: "Bank",
    helperText: "Checking or digital wallet",
  },
  {
    value: "SAVINGS",
    label: "Savings",
    helperText: "Reserve funds",
  },
];

export const accountTypeFilterOptions: SelectMenuOption[] = [
  {
    value: "ALL",
    label: "All types",
  },
  {
    value: "CASH",
    label: "Cash only",
  },
  {
    value: "BANK",
    label: "Bank only",
  },
  {
    value: "SAVINGS",
    label: "Savings only",
  },
];
