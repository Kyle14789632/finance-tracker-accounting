import {
  categoryParamsSchema,
  createCategoryRequestSchema,
  listCategoriesQuerySchema,
  updateCategoryRequestSchema,
} from "@sft/shared";
import { getRequestContext } from "../../core/http/auth-context";
import { asyncHandler } from "../../core/http/async-handler";
import { categoryService } from "./category.service";

export const listCategoriesController = asyncHandler(async (req, res) => {
  const query = listCategoriesQuerySchema.parse(req.query);
  const context = getRequestContext(res);
  const categories = await categoryService.listCategories(context.userId, query);
  res.status(200).json({ categories });
});

export const createCategoryController = asyncHandler(async (req, res) => {
  const payload = createCategoryRequestSchema.parse(req.body);
  const context = getRequestContext(res);
  const category = await categoryService.createCategory(context.userId, payload);
  res.status(201).json({ category });
});

export const updateCategoryController = asyncHandler(async (req, res) => {
  const { id } = categoryParamsSchema.parse(req.params);
  const payload = updateCategoryRequestSchema.parse(req.body);
  const context = getRequestContext(res);
  const category = await categoryService.updateCategory(context.userId, id, payload);
  res.status(200).json({ category });
});

export const archiveCategoryController = asyncHandler(async (req, res) => {
  const { id } = categoryParamsSchema.parse(req.params);
  const context = getRequestContext(res);
  const category = await categoryService.archiveCategory(context.userId, id);
  res.status(200).json({ category });
});
