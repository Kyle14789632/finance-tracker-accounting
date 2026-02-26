import type {
  BalanceSheetQuery,
  BalanceSheetResponse,
  IncomeStatementQuery,
  IncomeStatementResponse
} from "@sft/shared";
import {
  balanceSheetQuerySchema,
  balanceSheetResponseSchema,
  incomeStatementQuerySchema,
  incomeStatementResponseSchema
} from "./schemas";
import { apiRequest } from "../../utils/api-client";

const buildIncomeStatementPath = (query: IncomeStatementQuery): string => {
  const searchParams = new URLSearchParams();
  searchParams.set("month", query.month);
  return `/reports/income-statement?${searchParams.toString()}`;
};

const buildBalanceSheetPath = (query: BalanceSheetQuery): string => {
  const searchParams = new URLSearchParams();
  searchParams.set("asOf", query.asOf);
  return `/reports/balance-sheet?${searchParams.toString()}`;
};

export const getIncomeStatement = async (
  accessToken: string,
  query: IncomeStatementQuery
): Promise<IncomeStatementResponse> => {
  const parsedQuery = incomeStatementQuerySchema.parse(query);
  const response = await apiRequest<unknown>(buildIncomeStatementPath(parsedQuery), {
    accessToken
  });

  return incomeStatementResponseSchema.parse(response);
};

export const getBalanceSheet = async (
  accessToken: string,
  query: BalanceSheetQuery
): Promise<BalanceSheetResponse> => {
  const parsedQuery = balanceSheetQuerySchema.parse(query);
  const response = await apiRequest<unknown>(buildBalanceSheetPath(parsedQuery), {
    accessToken
  });

  return balanceSheetResponseSchema.parse(response);
};
