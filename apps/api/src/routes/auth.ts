import { Router } from "express";
import {
  loginController,
  logoutController,
  registerController
} from "../controllers/auth-controller";
import { requireAuth } from "../middleware/require-auth";

const router = Router();

router.post("/register", registerController);
router.post("/login", loginController);
router.post("/logout", requireAuth, logoutController);

export default router;
