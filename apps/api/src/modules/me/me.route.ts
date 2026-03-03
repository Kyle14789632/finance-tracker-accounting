import { Router } from "express";
import { requireAuth } from "../../middleware/require-auth";
import { getMeController, updateMeSettingsController } from "./me.controller";

const meRouter = Router();

meRouter.get("/", requireAuth, getMeController);
meRouter.patch("/settings", requireAuth, updateMeSettingsController);

export default meRouter;
