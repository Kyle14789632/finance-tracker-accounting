import { Router } from "express";
import {
  createTransactionController,
  deleteTransactionController,
  getTransactionJournalController,
  listTransactionsController,
  updateTransactionController
} from "../controllers/transaction-controller";
import { requireAuth } from "../middleware/require-auth";

const router = Router();

router.use(requireAuth);

router.get("/", listTransactionsController);
router.get("/:id/journal", getTransactionJournalController);
router.post("/", createTransactionController);
router.patch("/:id", updateTransactionController);
router.delete("/:id", deleteTransactionController);

export default router;
