import { useMutation } from "@tanstack/react-query";
import { login, logout, register } from "../api";

export const useLoginMutation = () => {
  return useMutation({
    mutationFn: login,
  });
};

export const useRegisterMutation = () => {
  return useMutation({
    mutationFn: register,
  });
};

export const useLogoutMutation = (accessToken: string | null, onSettled: () => void) => {
  return useMutation({
    mutationFn: async () => {
      if (!accessToken) {
        return;
      }

      await logout(accessToken);
    },
    onSettled,
  });
};
