import assert from "node:assert/strict";
import type { Category } from "../../../prisma/generated/client";
import { AppError } from "../../core/errors/app-error";
import { runSuite } from "../../test/unit-test-utils";
import { createCategoryService } from "./category.service";
import type { CategoryRepository } from "./category.repository";

const makeCategory = (overrides?: Partial<Category>): Category => ({
  id: "11111111-1111-1111-1111-111111111111",
  userId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
  name: "Salary",
  type: "INCOME",
  isArchived: false,
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  ...overrides,
});

export const runCategoryServiceTests = async (): Promise<number> => {
  return runSuite("categories.service", [
    {
      name: "lists active categories with mapped fields",
      run: async () => {
        const repository: CategoryRepository = {
          listActiveByUser: async () => [makeCategory()],
          findActiveById: async () => makeCategory(),
          create: async () => makeCategory(),
          update: async () => makeCategory(),
          archive: async () => makeCategory({ isArchived: true }),
        };

        const service = createCategoryService({ repository });
        const categories = await service.listCategories("user-id", {});

        assert.equal(categories.length, 1);
        assert.equal(categories[0].id, "11111111-1111-1111-1111-111111111111");
        assert.equal(categories[0].createdAt, "2026-01-01T00:00:00.000Z");
      },
    },
    {
      name: "update throws CATEGORY_NOT_FOUND when category is missing",
      run: async () => {
        const repository: CategoryRepository = {
          listActiveByUser: async () => [],
          findActiveById: async () => null,
          create: async () => makeCategory(),
          update: async () => makeCategory(),
          archive: async () => makeCategory({ isArchived: true }),
        };

        const service = createCategoryService({ repository });

        await assert.rejects(
          () =>
            service.updateCategory("user-id", "missing-category-id", {
              name: "Updated",
              type: "INCOME",
            }),
          (error: unknown) => {
            assert.ok(error instanceof AppError);
            assert.equal(error.code, "CATEGORY_NOT_FOUND");
            assert.equal(error.statusCode, 404);
            return true;
          },
        );
      },
    },
  ]);
};
