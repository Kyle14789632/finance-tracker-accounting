import { Router } from "express";
import { requireAuth } from "../../middleware/require-auth";
import {
  archiveCategoryController,
  createCategoryController,
  listCategoriesController,
  updateCategoryController,
} from "./category.controller";

const categoriesRouter = Router();

categoriesRouter.use(requireAuth);

categoriesRouter.get("/", listCategoriesController);
categoriesRouter.post("/", createCategoryController);
categoriesRouter.patch("/:id", updateCategoryController);
categoriesRouter.delete("/:id", archiveCategoryController);

export default categoriesRouter;
