import {
  balanceSheetQuerySchema,
  categoryBreakdownQuerySchema,
  incomeStatementQuerySchema,
  monthlySummaryQuerySchema,
} from "@sft/shared";
import { getRequestContext } from "../../core/http/auth-context";
import { asyncHandler } from "../../core/http/async-handler";
import { reportService } from "./report.service";

export const getMonthlySummaryController = asyncHandler(async (req, res) => {
  const query = monthlySummaryQuerySchema.parse(req.query);
  const context = getRequestContext(res);
  const summary = await reportService.getMonthlySummary(context.userId, query);
  res.status(200).json({ summary });
});

export const getCategoryBreakdownController = asyncHandler(async (req, res) => {
  const query = categoryBreakdownQuerySchema.parse(req.query);
  const context = getRequestContext(res);
  const breakdown = await reportService.getCategoryBreakdown(context.userId, query);
  res.status(200).json({ breakdown });
});

export const getIncomeStatementController = asyncHandler(async (req, res) => {
  const query = incomeStatementQuerySchema.parse(req.query);
  const context = getRequestContext(res);
  const statement = await reportService.getIncomeStatement(context.userId, query);
  res.status(200).json({ statement });
});

export const getBalanceSheetController = asyncHandler(async (req, res) => {
  const query = balanceSheetQuerySchema.parse(req.query);
  const context = getRequestContext(res);
  const statement = await reportService.getBalanceSheet(context.userId, query);
  res.status(200).json({ statement });
});
