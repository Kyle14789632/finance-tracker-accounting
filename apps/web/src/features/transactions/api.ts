import type {
  CreateTransactionRequest,
  JournalEntriesResponse,
  ListTransactionsQuery,
  ListTransactionsResponse,
  TransactionResponse,
  UpdateTransactionRequest
} from "@sft/shared";
import {
  createTransactionRequestSchema,
  journalEntriesResponseSchema,
  listTransactionsQuerySchema,
  listTransactionsResponseSchema,
  transactionResponseSchema,
  updateTransactionRequestSchema
} from "./schemas";
import { apiRequest } from "../../utils/api-client";

const buildTransactionsPath = (query: ListTransactionsQuery): string => {
  const searchParams = new URLSearchParams();
  searchParams.set("month", query.month);

  if (query.type) {
    searchParams.set("type", query.type);
  }

  if (query.accountId) {
    searchParams.set("accountId", query.accountId);
  }

  if (query.categoryId) {
    searchParams.set("categoryId", query.categoryId);
  }

  return `/transactions?${searchParams.toString()}`;
};

export const getTransactions = async (
  accessToken: string,
  query: ListTransactionsQuery
): Promise<ListTransactionsResponse> => {
  const parsedQuery = listTransactionsQuerySchema.parse(query);
  const response = await apiRequest<unknown>(buildTransactionsPath(parsedQuery), {
    accessToken
  });

  return listTransactionsResponseSchema.parse(response);
};

export const createTransaction = async (
  accessToken: string,
  payload: CreateTransactionRequest
): Promise<TransactionResponse> => {
  const parsedPayload = createTransactionRequestSchema.parse(payload);
  const response = await apiRequest<unknown>("/transactions", {
    method: "POST",
    accessToken,
    body: parsedPayload
  });

  return transactionResponseSchema.parse(response);
};

export const updateTransaction = async (
  accessToken: string,
  transactionId: string,
  payload: UpdateTransactionRequest
): Promise<TransactionResponse> => {
  const parsedPayload = updateTransactionRequestSchema.parse(payload);
  const response = await apiRequest<unknown>(`/transactions/${transactionId}`, {
    method: "PATCH",
    accessToken,
    body: parsedPayload
  });

  return transactionResponseSchema.parse(response);
};

export const deleteTransaction = async (
  accessToken: string,
  transactionId: string
): Promise<TransactionResponse> => {
  const response = await apiRequest<unknown>(`/transactions/${transactionId}`, {
    method: "DELETE",
    accessToken
  });

  return transactionResponseSchema.parse(response);
};

export const getTransactionJournal = async (
  accessToken: string,
  transactionId: string
): Promise<JournalEntriesResponse> => {
  const response = await apiRequest<unknown>(`/transactions/${transactionId}/journal`, {
    accessToken
  });

  return journalEntriesResponseSchema.parse(response);
};
