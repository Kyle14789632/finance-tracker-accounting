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

export const listCategoriesResponseSchema = z.object({
  categories: z.array(categorySchema)
});

export const categoryResponseSchema = z.object({
  category: categorySchema
});
