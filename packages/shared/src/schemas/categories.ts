import { z } from "zod";

export const categoryTypeSchema = z.enum(["INCOME", "EXPENSE"]);

export const categorySchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  type: categoryTypeSchema,
  isArchived: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
});

export const listCategoriesQuerySchema = z
  .object({
    type: categoryTypeSchema.optional()
  })
  .strict();

export const createCategoryRequestSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required").max(100, "Name must be at most 100 characters"),
    type: categoryTypeSchema
  })
  .strict();

export const updateCategoryRequestSchema = createCategoryRequestSchema;

export const categoryParamsSchema = z
  .object({
    id: z.string().uuid("Category id must be a valid UUID")
  })
  .strict();

export const listCategoriesResponseSchema = z.object({
  categories: z.array(categorySchema)
});

export const categoryResponseSchema = z.object({
  category: categorySchema
});

export type CategoryType = z.infer<typeof categoryTypeSchema>;
export type Category = z.infer<typeof categorySchema>;
export type ListCategoriesQuery = z.infer<typeof listCategoriesQuerySchema>;
export type CreateCategoryRequest = z.infer<typeof createCategoryRequestSchema>;
export type UpdateCategoryRequest = z.infer<typeof updateCategoryRequestSchema>;
export type CategoryParams = z.infer<typeof categoryParamsSchema>;
export type ListCategoriesResponse = z.infer<typeof listCategoriesResponseSchema>;
export type CategoryResponse = z.infer<typeof categoryResponseSchema>;
