import type { RequestHandler } from "express";
import {
  createTransactionRequestSchema,
  listTransactionsQuerySchema,
  transactionParamsSchema,
  updateTransactionRequestSchema
} from "@sft/shared";
import type { AuthLocals } from "../middleware/require-auth";
import { transactionService } from "../services/transaction-service";

export const listTransactionsController: RequestHandler<
  unknown,
  unknown,
  unknown,
  unknown,
  AuthLocals
> = async (req, res, next) => {
  try {
    const query = listTransactionsQuerySchema.parse(req.query);
    const transactions = await transactionService.listTransactions(res.locals.auth.userId, query);
    res.status(200).json({ transactions });
  } catch (error) {
    next(error);
  }
};

export const createTransactionController: RequestHandler<
  unknown,
  unknown,
  unknown,
  unknown,
  AuthLocals
> = async (req, res, next) => {
  try {
    const payload = createTransactionRequestSchema.parse(req.body);
    const transaction = await transactionService.createTransaction(res.locals.auth.userId, payload);
    res.status(201).json({ transaction });
  } catch (error) {
    next(error);
  }
};

export const updateTransactionController: RequestHandler<
  unknown,
  unknown,
  unknown,
  unknown,
  AuthLocals
> = async (req, res, next) => {
  try {
    const { id } = transactionParamsSchema.parse(req.params);
    const payload = updateTransactionRequestSchema.parse(req.body);
    const transaction = await transactionService.updateTransaction(res.locals.auth.userId, id, payload);
    res.status(200).json({ transaction });
  } catch (error) {
    next(error);
  }
};

export const deleteTransactionController: RequestHandler<
  unknown,
  unknown,
  unknown,
  unknown,
  AuthLocals
> = async (req, res, next) => {
  try {
    const { id } = transactionParamsSchema.parse(req.params);
    const transaction = await transactionService.deleteTransaction(res.locals.auth.userId, id);
    res.status(200).json({ transaction });
  } catch (error) {
    next(error);
  }
};

export const getTransactionJournalController: RequestHandler<
  unknown,
  unknown,
  unknown,
  unknown,
  AuthLocals
> = async (req, res, next) => {
  try {
    const { id } = transactionParamsSchema.parse(req.params);
    const journalEntries = await transactionService.getTransactionJournal(res.locals.auth.userId, id);
    res.status(200).json({ journalEntries });
  } catch (error) {
    next(error);
  }
};
