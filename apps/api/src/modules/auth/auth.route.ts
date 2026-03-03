import { Router } from "express";
import { requireAuth } from "../../middleware/require-auth";
import { loginController, logoutController, registerController } from "./auth.controller";

const authRouter = Router();

authRouter.post("/register", registerController);
authRouter.post("/login", loginController);
authRouter.post("/logout", requireAuth, logoutController);

export default authRouter;
