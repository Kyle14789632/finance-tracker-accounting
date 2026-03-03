import type {
  Category as CategoryRecord,
  CategoryType as PrismaCategoryType,
} from "../../../prisma/generated/client";
import type {
  CreateCategoryRequest,
  ListCategoriesQuery,
  UpdateCategoryRequest,
} from "@sft/shared";
import { prisma } from "../../core/db/prisma";

export type CategoryRepository = {
  listActiveByUser: (userId: string, query: ListCategoriesQuery) => Promise<CategoryRecord[]>;
  findActiveById: (userId: string, categoryId: string) => Promise<CategoryRecord | null>;
  create: (userId: string, payload: CreateCategoryRequest) => Promise<CategoryRecord>;
  update: (categoryId: string, payload: UpdateCategoryRequest) => Promise<CategoryRecord>;
  archive: (categoryId: string) => Promise<CategoryRecord>;
};

export const createCategoryRepository = (): CategoryRepository => ({
  listActiveByUser: (userId, query) =>
    prisma.category.findMany({
      where: {
        userId,
        isArchived: false,
        type: query.type as PrismaCategoryType | undefined,
      },
      orderBy: [{ name: "asc" }, { createdAt: "asc" }],
    }),

  findActiveById: (userId, categoryId) =>
    prisma.category.findFirst({
      where: {
        id: categoryId,
        userId,
        isArchived: false,
      },
    }),

  create: (userId, payload) =>
    prisma.category.create({
      data: {
        userId,
        name: payload.name,
        type: payload.type as PrismaCategoryType,
      },
    }),

  update: (categoryId, payload) =>
    prisma.category.update({
      where: { id: categoryId },
      data: {
        name: payload.name,
        type: payload.type as PrismaCategoryType,
      },
    }),

  archive: (categoryId) =>
    prisma.category.update({
      where: { id: categoryId },
      data: {
        isArchived: true,
      },
    }),
});
