import {
  createTransactionRequestSchema,
  listTransactionsQuerySchema,
  transactionParamsSchema,
  updateTransactionRequestSchema,
} from "@sft/shared";
import { getRequestContext } from "../../core/http/auth-context";
import { asyncHandler } from "../../core/http/async-handler";
import { transactionService } from "./transaction.service";

export const listTransactionsController = asyncHandler(async (req, res) => {
  const query = listTransactionsQuerySchema.parse(req.query);
  const context = getRequestContext(res);
  const transactions = await transactionService.listTransactions(context.userId, query);
  res.status(200).json({ transactions });
});

export const createTransactionController = asyncHandler(async (req, res) => {
  const payload = createTransactionRequestSchema.parse(req.body);
  const context = getRequestContext(res);
  const transaction = await transactionService.createTransaction(context.userId, payload);
  res.status(201).json({ transaction });
});

export const updateTransactionController = asyncHandler(async (req, res) => {
  const { id } = transactionParamsSchema.parse(req.params);
  const payload = updateTransactionRequestSchema.parse(req.body);
  const context = getRequestContext(res);
  const transaction = await transactionService.updateTransaction(context.userId, id, payload);
  res.status(200).json({ transaction });
});

export const deleteTransactionController = asyncHandler(async (req, res) => {
  const { id } = transactionParamsSchema.parse(req.params);
  const context = getRequestContext(res);
  const transaction = await transactionService.deleteTransaction(context.userId, id);
  res.status(200).json({ transaction });
});

export const getTransactionJournalController = asyncHandler(async (req, res) => {
  const { id } = transactionParamsSchema.parse(req.params);
  const context = getRequestContext(res);
  const journalEntries = await transactionService.getTransactionJournal(context.userId, id);
  res.status(200).json({ journalEntries });
});
