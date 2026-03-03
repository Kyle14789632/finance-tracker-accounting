import type { Category as CategoryRecord } from "../../../prisma/generated/client";
import type { Category, CategoryType } from "@sft/shared";

export const toCategory = (category: CategoryRecord): Category => ({
  id: category.id,
  name: category.name,
  type: category.type as CategoryType,
  isArchived: category.isArchived,
  createdAt: category.createdAt.toISOString(),
  updatedAt: category.updatedAt.toISOString(),
});
