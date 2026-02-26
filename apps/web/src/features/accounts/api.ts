import type {
  AccountResponse,
  CreateAccountRequest,
  ListAccountsQuery,
  ListAccountsResponse,
  UpdateAccountRequest
} from "@sft/shared";
import {
  accountResponseSchema,
  createAccountRequestSchema,
  listAccountsQuerySchema,
  listAccountsResponseSchema,
  updateAccountRequestSchema
} from "./schemas";
import { apiRequest } from "../../utils/api-client";

const buildAccountsPath = (query: ListAccountsQuery): string => {
  const searchParams = new URLSearchParams();

  if (query.type) {
    searchParams.set("type", query.type);
  }

  const queryString = searchParams.toString();
  return queryString ? `/accounts?${queryString}` : "/accounts";
};

export const getAccounts = async (
  accessToken: string,
  query: ListAccountsQuery = {}
): Promise<ListAccountsResponse> => {
  const parsedQuery = listAccountsQuerySchema.parse(query);
  const response = await apiRequest<unknown>(buildAccountsPath(parsedQuery), {
    accessToken
  });

  return listAccountsResponseSchema.parse(response);
};

export const createAccount = async (
  accessToken: string,
  payload: CreateAccountRequest
): Promise<AccountResponse> => {
  const parsedPayload = createAccountRequestSchema.parse(payload);
  const response = await apiRequest<unknown>("/accounts", {
    method: "POST",
    accessToken,
    body: parsedPayload
  });

  return accountResponseSchema.parse(response);
};

export const updateAccount = async (
  accessToken: string,
  accountId: string,
  payload: UpdateAccountRequest
): Promise<AccountResponse> => {
  const parsedPayload = updateAccountRequestSchema.parse(payload);
  const response = await apiRequest<unknown>(`/accounts/${accountId}`, {
    method: "PATCH",
    accessToken,
    body: parsedPayload
  });

  return accountResponseSchema.parse(response);
};

export const archiveAccount = async (
  accessToken: string,
  accountId: string
): Promise<AccountResponse> => {
  const response = await apiRequest<unknown>(`/accounts/${accountId}`, {
    method: "DELETE",
    accessToken
  });

  return accountResponseSchema.parse(response);
};
