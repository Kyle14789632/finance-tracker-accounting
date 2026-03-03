import type { CategoryType } from "@sft/shared";
import { useQuery } from "@tanstack/react-query";
import { getCategoryBreakdown, getMonthlySummary } from "../api";
import { reportsQueryKeys } from "../queryKeys";

export const useMonthlySummaryQuery = (accessToken: string | null, month: string) => {
  return useQuery({
    queryKey: reportsQueryKeys.monthlySummary(month),
    enabled: Boolean(accessToken),
    queryFn: () => getMonthlySummary(accessToken as string, { month }),
  });
};

export const useCategoryBreakdownQuery = (
  accessToken: string | null,
  month: string,
  type: CategoryType,
) => {
  return useQuery({
    queryKey: reportsQueryKeys.categoryBreakdown(month, type),
    enabled: Boolean(accessToken),
    queryFn: () =>
      getCategoryBreakdown(accessToken as string, {
        month,
        type,
      }),
  });
};
