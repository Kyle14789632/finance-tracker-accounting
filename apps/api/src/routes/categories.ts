import { Router } from "express";
import {
  archiveCategoryController,
  createCategoryController,
  listCategoriesController,
  updateCategoryController
} from "../controllers/category-controller";
import { requireAuth } from "../middleware/require-auth";

const router = Router();

router.use(requireAuth);

router.get("/", listCategoriesController);
router.post("/", createCategoryController);
router.patch("/:id", updateCategoryController);
router.delete("/:id", archiveCategoryController);

export default router;
