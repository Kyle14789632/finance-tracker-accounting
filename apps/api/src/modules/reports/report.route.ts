import { Router } from "express";
import { requireAuth } from "../../middleware/require-auth";
import {
  getBalanceSheetController,
  getCategoryBreakdownController,
  getIncomeStatementController,
  getMonthlySummaryController,
} from "./report.controller";

const reportsRouter = Router();

reportsRouter.use(requireAuth);

reportsRouter.get("/monthly-summary", getMonthlySummaryController);
reportsRouter.get("/category-breakdown", getCategoryBreakdownController);
reportsRouter.get("/income-statement", getIncomeStatementController);
reportsRouter.get("/balance-sheet", getBalanceSheetController);

export default reportsRouter;
