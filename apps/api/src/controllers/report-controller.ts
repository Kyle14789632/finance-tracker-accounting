import type { RequestHandler } from "express";
import {
  balanceSheetQuerySchema,
  categoryBreakdownQuerySchema,
  incomeStatementQuerySchema,
  monthlySummaryQuerySchema
} from "@sft/shared";
import type { AuthLocals } from "../middleware/require-auth";
import { reportService } from "../services/report-service";

export const getMonthlySummaryController: RequestHandler<
  unknown,
  unknown,
  unknown,
  unknown,
  AuthLocals
> = async (req, res, next) => {
  try {
    const query = monthlySummaryQuerySchema.parse(req.query);
    const summary = await reportService.getMonthlySummary(res.locals.auth.userId, query);
    res.status(200).json({ summary });
  } catch (error) {
    next(error);
  }
};

export const getCategoryBreakdownController: RequestHandler<
  unknown,
  unknown,
  unknown,
  unknown,
  AuthLocals
> = async (req, res, next) => {
  try {
    const query = categoryBreakdownQuerySchema.parse(req.query);
    const breakdown = await reportService.getCategoryBreakdown(res.locals.auth.userId, query);
    res.status(200).json({ breakdown });
  } catch (error) {
    next(error);
  }
};

export const getIncomeStatementController: RequestHandler<
  unknown,
  unknown,
  unknown,
  unknown,
  AuthLocals
> = async (req, res, next) => {
  try {
    const query = incomeStatementQuerySchema.parse(req.query);
    const statement = await reportService.getIncomeStatement(res.locals.auth.userId, query);
    res.status(200).json({ statement });
  } catch (error) {
    next(error);
  }
};

export const getBalanceSheetController: RequestHandler<
  unknown,
  unknown,
  unknown,
  unknown,
  AuthLocals
> = async (req, res, next) => {
  try {
    const query = balanceSheetQuerySchema.parse(req.query);
    const statement = await reportService.getBalanceSheet(res.locals.auth.userId, query);
    res.status(200).json({ statement });
  } catch (error) {
    next(error);
  }
};
