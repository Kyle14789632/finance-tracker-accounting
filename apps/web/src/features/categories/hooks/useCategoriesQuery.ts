import { useQuery } from "@tanstack/react-query";
import type { CategoryType } from "@sft/shared";
import { getCategories } from "../api";
import { categoriesQueryKeys } from "../queryKeys";

export const useCategoriesQuery = (
  accessToken: string | null,
  activeTypeFilter: "ALL" | CategoryType,
) => {
  return useQuery({
    queryKey: categoriesQueryKeys.list(activeTypeFilter),
    enabled: Boolean(accessToken),
    queryFn: () =>
      getCategories(
        accessToken as string,
        activeTypeFilter === "ALL" ? {} : { type: activeTypeFilter },
      ),
  });
};
