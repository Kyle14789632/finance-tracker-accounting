import { Router } from "express";
import {
  getBalanceSheetController,
  getCategoryBreakdownController,
  getIncomeStatementController,
  getMonthlySummaryController
} from "../controllers/report-controller";
import { requireAuth } from "../middleware/require-auth";

const router = Router();

router.use(requireAuth);

router.get("/monthly-summary", getMonthlySummaryController);
router.get("/category-breakdown", getCategoryBreakdownController);
router.get("/income-statement", getIncomeStatementController);
router.get("/balance-sheet", getBalanceSheetController);

export default router;
