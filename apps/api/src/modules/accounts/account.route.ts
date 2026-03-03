import { Router } from "express";
import { requireAuth } from "../../middleware/require-auth";
import {
  archiveAccountController,
  createAccountController,
  listAccountsController,
  updateAccountController,
} from "./account.controller";

const accountsRouter = Router();

accountsRouter.use(requireAuth);

accountsRouter.get("/", listAccountsController);
accountsRouter.post("/", createAccountController);
accountsRouter.patch("/:id", updateAccountController);
accountsRouter.delete("/:id", archiveAccountController);

export default accountsRouter;
