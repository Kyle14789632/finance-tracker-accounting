import type {
  Category,
  CreateCategoryRequest,
  ListCategoriesQuery,
  UpdateCategoryRequest,
} from "@sft/shared";
import { AppError } from "../../core/errors/app-error";
import { toCategory } from "./category.mapper";
import { createCategoryRepository, type CategoryRepository } from "./category.repository";

export type CategoryService = {
  listCategories: (userId: string, query: ListCategoriesQuery) => Promise<Category[]>;
  createCategory: (userId: string, payload: CreateCategoryRequest) => Promise<Category>;
  updateCategory: (
    userId: string,
    categoryId: string,
    payload: UpdateCategoryRequest,
  ) => Promise<Category>;
  archiveCategory: (userId: string, categoryId: string) => Promise<Category>;
};

type CategoryServiceDeps = {
  repository: CategoryRepository;
};

const ensureActiveCategory = async (
  repository: CategoryRepository,
  userId: string,
  categoryId: string,
): Promise<void> => {
  const category = await repository.findActiveById(userId, categoryId);

  if (!category) {
    throw new AppError(404, "CATEGORY_NOT_FOUND", "Category not found");
  }
};

export const createCategoryService = ({ repository }: CategoryServiceDeps): CategoryService => ({
  listCategories: async (userId, query) => {
    const categories = await repository.listActiveByUser(userId, query);
    return categories.map(toCategory);
  },

  createCategory: async (userId, payload) => {
    const category = await repository.create(userId, payload);
    return toCategory(category);
  },

  updateCategory: async (userId, categoryId, payload) => {
    await ensureActiveCategory(repository, userId, categoryId);
    const updatedCategory = await repository.update(categoryId, payload);
    return toCategory(updatedCategory);
  },

  archiveCategory: async (userId, categoryId) => {
    await ensureActiveCategory(repository, userId, categoryId);
    const archivedCategory = await repository.archive(categoryId);
    return toCategory(archivedCategory);
  },
});

export const categoryService = createCategoryService({
  repository: createCategoryRepository(),
});
