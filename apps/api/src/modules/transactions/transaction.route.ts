import { Router } from "express";
import { requireAuth } from "../../middleware/require-auth";
import {
  createTransactionController,
  deleteTransactionController,
  getTransactionJournalController,
  listTransactionsController,
  updateTransactionController,
} from "./transaction.controller";

const transactionsRouter = Router();

transactionsRouter.use(requireAuth);

transactionsRouter.get("/", listTransactionsController);
transactionsRouter.get("/:id/journal", getTransactionJournalController);
transactionsRouter.post("/", createTransactionController);
transactionsRouter.patch("/:id", updateTransactionController);
transactionsRouter.delete("/:id", deleteTransactionController);

export default transactionsRouter;
