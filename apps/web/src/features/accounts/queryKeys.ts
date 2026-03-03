import type { AccountType } from "@sft/shared";

export const accountsQueryKeys = {
  all: ["accounts"] as const,
  list: (typeFilter: "ALL" | AccountType) => ["accounts", typeFilter] as const,
};
