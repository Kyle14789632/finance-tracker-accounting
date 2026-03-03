import { useMutation, useQueryClient, type UseMutationResult } from "@tanstack/react-query";
import type { CreateTransactionRequest } from "@sft/shared";
import { createTransaction, deleteTransaction, updateTransaction } from "../api";
import { transactionsQueryKeys } from "../queryKeys";

type UseTransactionMutationsResult = {
  createTransactionMutation: UseMutationResult<unknown, unknown, CreateTransactionRequest>;
  updateTransactionMutation: UseMutationResult<
    unknown,
    unknown,
    {
      transactionId: string;
      payload: CreateTransactionRequest;
    }
  >;
  deleteTransactionMutation: UseMutationResult<unknown, unknown, string>;
};

export const useTransactionMutations = (
  accessToken: string | null,
): UseTransactionMutationsResult => {
  const queryClient = useQueryClient();

  const createTransactionMutation = useMutation({
    mutationFn: (payload: CreateTransactionRequest) =>
      createTransaction(accessToken as string, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: transactionsQueryKeys.all });
    },
  });

  const updateTransactionMutation = useMutation({
    mutationFn: (params: { transactionId: string; payload: CreateTransactionRequest }) =>
      updateTransaction(accessToken as string, params.transactionId, params.payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: transactionsQueryKeys.all });
    },
  });

  const deleteTransactionMutation = useMutation({
    mutationFn: (transactionId: string) => deleteTransaction(accessToken as string, transactionId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: transactionsQueryKeys.all });
    },
  });

  return {
    createTransactionMutation,
    updateTransactionMutation,
    deleteTransactionMutation,
  };
};
