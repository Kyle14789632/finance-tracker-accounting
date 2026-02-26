import type { RequestHandler } from "express";
import {
  categoryParamsSchema,
  createCategoryRequestSchema,
  listCategoriesQuerySchema,
  updateCategoryRequestSchema
} from "@sft/shared";
import type { AuthLocals } from "../middleware/require-auth";
import { categoryService } from "../services/category-service";

export const listCategoriesController: RequestHandler<
  unknown,
  unknown,
  unknown,
  unknown,
  AuthLocals
> = async (req, res, next) => {
  try {
    const query = listCategoriesQuerySchema.parse(req.query);
    const categories = await categoryService.listCategories(res.locals.auth.userId, query);
    res.status(200).json({ categories });
  } catch (error) {
    next(error);
  }
};

export const createCategoryController: RequestHandler<
  unknown,
  unknown,
  unknown,
  unknown,
  AuthLocals
> = async (req, res, next) => {
  try {
    const payload = createCategoryRequestSchema.parse(req.body);
    const category = await categoryService.createCategory(res.locals.auth.userId, payload);
    res.status(201).json({ category });
  } catch (error) {
    next(error);
  }
};

export const updateCategoryController: RequestHandler<
  unknown,
  unknown,
  unknown,
  unknown,
  AuthLocals
> = async (req, res, next) => {
  try {
    const { id } = categoryParamsSchema.parse(req.params);
    const payload = updateCategoryRequestSchema.parse(req.body);
    const category = await categoryService.updateCategory(res.locals.auth.userId, id, payload);
    res.status(200).json({ category });
  } catch (error) {
    next(error);
  }
};

export const archiveCategoryController: RequestHandler<
  unknown,
  unknown,
  unknown,
  unknown,
  AuthLocals
> = async (req, res, next) => {
  try {
    const { id } = categoryParamsSchema.parse(req.params);
    const category = await categoryService.archiveCategory(res.locals.auth.userId, id);
    res.status(200).json({ category });
  } catch (error) {
    next(error);
  }
};
