import type { CategoryType } from "@sft/shared";

export const categoriesQueryKeys = {
  all: ["categories"] as const,
  list: (typeFilter: "ALL" | CategoryType) => ["categories", typeFilter] as const,
};
