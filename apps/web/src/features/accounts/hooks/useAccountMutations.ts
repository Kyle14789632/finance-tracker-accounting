import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreateAccountRequest } from "@sft/shared";
import { archiveAccount, createAccount, updateAccount } from "../api";
import { accountsQueryKeys } from "../queryKeys";

export const useAccountMutations = (accessToken: string | null) => {
  const queryClient = useQueryClient();

  const createAccountMutation = useMutation({
    mutationFn: (payload: CreateAccountRequest) => createAccount(accessToken as string, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: accountsQueryKeys.all });
    },
  });

  const updateAccountMutation = useMutation({
    mutationFn: (params: { accountId: string; payload: CreateAccountRequest }) =>
      updateAccount(accessToken as string, params.accountId, params.payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: accountsQueryKeys.all });
    },
  });

  const archiveAccountMutation = useMutation({
    mutationFn: (accountId: string) => archiveAccount(accessToken as string, accountId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: accountsQueryKeys.all });
    },
  });

  return {
    createAccountMutation,
    updateAccountMutation,
    archiveAccountMutation,
  };
};
