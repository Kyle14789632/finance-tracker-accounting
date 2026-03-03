import type { SelectMenuOption } from "../../components/ui/SelectMenuField";

export const currentMonth = new Date().toISOString().slice(0, 7);
export const currentAsOfDate = new Date().toISOString().slice(0, 10);

export type StatementsTab = "income-statement" | "balance-sheet";

export const statementsTabOptions: SelectMenuOption[] = [
  {
    value: "income-statement",
    label: "Income Statement",
  },
  {
    value: "balance-sheet",
    label: "Balance Sheet",
  },
];
