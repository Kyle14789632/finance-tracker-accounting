import { Router } from "express";
import {
  archiveAccountController,
  createAccountController,
  listAccountsController,
  updateAccountController
} from "../controllers/account-controller";
import { requireAuth } from "../middleware/require-auth";

const router = Router();

router.use(requireAuth);

router.get("/", listAccountsController);
router.post("/", createAccountController);
router.patch("/:id", updateAccountController);
router.delete("/:id", archiveAccountController);

export default router;
