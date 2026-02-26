import type {
  CategoryBreakdownQuery,
  CategoryBreakdownResponse,
  MonthlySummaryQuery,
  MonthlySummaryResponse
} from "@sft/shared";
import {
  categoryBreakdownQuerySchema,
  categoryBreakdownResponseSchema,
  monthlySummaryQuerySchema,
  monthlySummaryResponseSchema
} from "./schemas";
import { apiRequest } from "../../utils/api-client";

const buildMonthlySummaryPath = (query: MonthlySummaryQuery): string => {
  const searchParams = new URLSearchParams();
  searchParams.set("month", query.month);
  return `/reports/monthly-summary?${searchParams.toString()}`;
};

const buildCategoryBreakdownPath = (query: CategoryBreakdownQuery): string => {
  const searchParams = new URLSearchParams();
  searchParams.set("month", query.month);
  searchParams.set("type", query.type);
  return `/reports/category-breakdown?${searchParams.toString()}`;
};

export const getMonthlySummary = async (
  accessToken: string,
  query: MonthlySummaryQuery
): Promise<MonthlySummaryResponse> => {
  const parsedQuery = monthlySummaryQuerySchema.parse(query);
  const response = await apiRequest<unknown>(buildMonthlySummaryPath(parsedQuery), {
    accessToken
  });

  return monthlySummaryResponseSchema.parse(response);
};

export const getCategoryBreakdown = async (
  accessToken: string,
  query: CategoryBreakdownQuery
): Promise<CategoryBreakdownResponse> => {
  const parsedQuery = categoryBreakdownQuerySchema.parse(query);
  const response = await apiRequest<unknown>(buildCategoryBreakdownPath(parsedQuery), {
    accessToken
  });

  return categoryBreakdownResponseSchema.parse(response);
};
