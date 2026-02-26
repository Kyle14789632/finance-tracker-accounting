import { Router } from "express";
import { getMeController, updateMeSettingsController } from "../controllers/me-controller";
import { requireAuth } from "../middleware/require-auth";

const router = Router();

router.get("/", requireAuth, getMeController);
router.patch("/settings", requireAuth, updateMeSettingsController);

export default router;
