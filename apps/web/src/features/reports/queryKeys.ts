import type { CategoryType } from "@sft/shared";

export const reportsQueryKeys = {
  monthlySummary: (month: string) => ["reports", "monthly-summary", month] as const,
  categoryBreakdown: (month: string, type: CategoryType) =>
    ["reports", "category-breakdown", month, type] as const,
};
