import { useQueryClient } from "@tanstack/react-query";
import type { PublicUser } from "@sft/shared";
import { type PropsWithChildren, useCallback, useEffect, useMemo, useState } from "react";
import { ApiError } from "../../utils/api-client";
import { AuthSessionContext, type AuthSessionContextValue } from "./auth-session-context";
import { useLogoutMutation } from "./hooks/useAuthMutations";
import { useAuthSessionQuery } from "./hooks/useAuthSessionQuery";
import { authQueryKeys } from "./queryKeys";
import {
  clearStoredAccessToken,
  getStoredAccessToken,
  setStoredAccessToken,
} from "./token-storage";

export const AuthSessionProvider = ({ children }: PropsWithChildren) => {
  const queryClient = useQueryClient();
  const [accessToken, setAccessToken] = useState<string | null>(() => getStoredAccessToken());

  const clearSession = useCallback(() => {
    clearStoredAccessToken();
    setAccessToken(null);
    queryClient.removeQueries({ queryKey: authQueryKeys.base });
  }, [queryClient]);

  const meQuery = useAuthSessionQuery(accessToken);

  useEffect(() => {
    if (meQuery.error instanceof ApiError && meQuery.error.status === 401 && accessToken) {
      clearSession();
    }
  }, [accessToken, clearSession, meQuery.error]);

  const setSession = useCallback(
    (nextAccessToken: string, user: PublicUser) => {
      setStoredAccessToken(nextAccessToken);
      setAccessToken(nextAccessToken);
      queryClient.setQueryData(authQueryKeys.session(nextAccessToken), {
        user,
      });
    },
    [queryClient],
  );

  const setCurrentUser = useCallback(
    (user: PublicUser) => {
      if (!accessToken) {
        return;
      }

      queryClient.setQueryData(authQueryKeys.session(accessToken), { user });
    },
    [accessToken, queryClient],
  );

  const logoutMutation = useLogoutMutation(accessToken, clearSession);

  const value = useMemo<AuthSessionContextValue>(() => {
    const user = meQuery.data?.user ?? null;

    return {
      accessToken,
      user,
      isSessionLoading: Boolean(accessToken) && meQuery.isLoading,
      isAuthenticated: Boolean(accessToken) && Boolean(user),
      isLoggingOut: logoutMutation.isPending,
      setSession,
      setCurrentUser,
      clearSession,
      logoutSession: async () => {
        await logoutMutation.mutateAsync();
      },
    };
  }, [
    accessToken,
    clearSession,
    logoutMutation,
    meQuery.data?.user,
    meQuery.isLoading,
    setCurrentUser,
    setSession,
  ]);

  return <AuthSessionContext.Provider value={value}>{children}</AuthSessionContext.Provider>;
};
