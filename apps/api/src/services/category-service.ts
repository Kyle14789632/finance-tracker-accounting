import type {
  Category as CategoryRecord,
  CategoryType as PrismaCategoryType
} from "../../prisma/generated/client";
import type {
  Category,
  CategoryType,
  CreateCategoryRequest,
  ListCategoriesQuery,
  UpdateCategoryRequest
} from "@sft/shared";
import { AppError } from "../utils/app-error";
import { prisma } from "../utils/prisma";

const toCategory = (category: CategoryRecord): Category => ({
  id: category.id,
  name: category.name,
  type: category.type as CategoryType,
  isArchived: category.isArchived,
  createdAt: category.createdAt.toISOString(),
  updatedAt: category.updatedAt.toISOString()
});

const findActiveCategoryOrThrow = async (
  userId: string,
  categoryId: string
): Promise<CategoryRecord> => {
  const category = await prisma.category.findFirst({
    where: {
      id: categoryId,
      userId,
      isArchived: false
    }
  });

  if (!category) {
    throw new AppError(404, "CATEGORY_NOT_FOUND", "Category not found");
  }

  return category;
};

const listCategories = async (userId: string, query: ListCategoriesQuery): Promise<Category[]> => {
  const categories = await prisma.category.findMany({
    where: {
      userId,
      isArchived: false,
      type: query.type as PrismaCategoryType | undefined
    },
    orderBy: [{ name: "asc" }, { createdAt: "asc" }]
  });

  return categories.map(toCategory);
};

const createCategory = async (
  userId: string,
  payload: CreateCategoryRequest
): Promise<Category> => {
  const category = await prisma.category.create({
    data: {
      userId,
      name: payload.name,
      type: payload.type as PrismaCategoryType
    }
  });

  return toCategory(category);
};

const updateCategory = async (
  userId: string,
  categoryId: string,
  payload: UpdateCategoryRequest
): Promise<Category> => {
  await findActiveCategoryOrThrow(userId, categoryId);

  const updatedCategory = await prisma.category.update({
    where: { id: categoryId },
    data: {
      name: payload.name,
      type: payload.type as PrismaCategoryType
    }
  });

  return toCategory(updatedCategory);
};

const archiveCategory = async (userId: string, categoryId: string): Promise<Category> => {
  await findActiveCategoryOrThrow(userId, categoryId);

  const archivedCategory = await prisma.category.update({
    where: { id: categoryId },
    data: {
      isArchived: true
    }
  });

  return toCategory(archivedCategory);
};

export const categoryService = {
  listCategories,
  createCategory,
  updateCategory,
  archiveCategory
};
