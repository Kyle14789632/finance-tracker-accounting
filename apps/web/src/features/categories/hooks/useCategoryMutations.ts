import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreateCategoryRequest } from "@sft/shared";
import { archiveCategory, createCategory, updateCategory } from "../api";
import { categoriesQueryKeys } from "../queryKeys";

export const useCategoryMutations = (accessToken: string | null) => {
  const queryClient = useQueryClient();

  const createCategoryMutation = useMutation({
    mutationFn: (payload: CreateCategoryRequest) => createCategory(accessToken as string, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: categoriesQueryKeys.all });
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: (params: { categoryId: string; payload: CreateCategoryRequest }) =>
      updateCategory(accessToken as string, params.categoryId, params.payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: categoriesQueryKeys.all });
    },
  });

  const archiveCategoryMutation = useMutation({
    mutationFn: (categoryId: string) => archiveCategory(accessToken as string, categoryId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: categoriesQueryKeys.all });
    },
  });

  return {
    createCategoryMutation,
    updateCategoryMutation,
    archiveCategoryMutation,
  };
};
