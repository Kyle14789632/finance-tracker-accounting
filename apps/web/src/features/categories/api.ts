import type {
  CategoryResponse,
  CreateCategoryRequest,
  ListCategoriesQuery,
  ListCategoriesResponse,
  UpdateCategoryRequest
} from "@sft/shared";
import {
  categoryResponseSchema,
  createCategoryRequestSchema,
  listCategoriesQuerySchema,
  listCategoriesResponseSchema,
  updateCategoryRequestSchema
} from "./schemas";
import { apiRequest } from "../../utils/api-client";

const buildCategoriesPath = (query: ListCategoriesQuery): string => {
  const searchParams = new URLSearchParams();

  if (query.type) {
    searchParams.set("type", query.type);
  }

  const queryString = searchParams.toString();
  return queryString ? `/categories?${queryString}` : "/categories";
};

export const getCategories = async (
  accessToken: string,
  query: ListCategoriesQuery = {}
): Promise<ListCategoriesResponse> => {
  const parsedQuery = listCategoriesQuerySchema.parse(query);
  const response = await apiRequest<unknown>(buildCategoriesPath(parsedQuery), {
    accessToken
  });

  return listCategoriesResponseSchema.parse(response);
};

export const createCategory = async (
  accessToken: string,
  payload: CreateCategoryRequest
): Promise<CategoryResponse> => {
  const parsedPayload = createCategoryRequestSchema.parse(payload);
  const response = await apiRequest<unknown>("/categories", {
    method: "POST",
    accessToken,
    body: parsedPayload
  });

  return categoryResponseSchema.parse(response);
};

export const updateCategory = async (
  accessToken: string,
  categoryId: string,
  payload: UpdateCategoryRequest
): Promise<CategoryResponse> => {
  const parsedPayload = updateCategoryRequestSchema.parse(payload);
  const response = await apiRequest<unknown>(`/categories/${categoryId}`, {
    method: "PATCH",
    accessToken,
    body: parsedPayload
  });

  return categoryResponseSchema.parse(response);
};

export const archiveCategory = async (
  accessToken: string,
  categoryId: string
): Promise<CategoryResponse> => {
  const response = await apiRequest<unknown>(`/categories/${categoryId}`, {
    method: "DELETE",
    accessToken
  });

  return categoryResponseSchema.parse(response);
};
