import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { PublicUser } from "@sft/shared";
import {
  type PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useState
} from "react";
import { ApiError } from "../../utils/api-client";
import { getMe, logout } from "./api";
import { AuthSessionContext, type AuthSessionContextValue } from "./auth-session-context";
import {
  clearStoredAccessToken,
  getStoredAccessToken,
  setStoredAccessToken
} from "./token-storage";

const authSessionQueryKey = ["auth", "me"];

export const AuthSessionProvider = ({ children }: PropsWithChildren) => {
  const queryClient = useQueryClient();
  const [accessToken, setAccessToken] = useState<string | null>(() => getStoredAccessToken());

  const clearSession = useCallback(() => {
    clearStoredAccessToken();
    setAccessToken(null);
    queryClient.removeQueries({ queryKey: authSessionQueryKey });
  }, [queryClient]);

  const meQuery = useQuery({
    queryKey: [...authSessionQueryKey, accessToken],
    queryFn: () => getMe(accessToken as string),
    enabled: Boolean(accessToken),
    retry: false,
    staleTime: 60_000
  });

  useEffect(() => {
    if (meQuery.error instanceof ApiError && meQuery.error.status === 401 && accessToken) {
      clearSession();
    }
  }, [accessToken, clearSession, meQuery.error]);

  const setSession = useCallback(
    (nextAccessToken: string, user: PublicUser) => {
      setStoredAccessToken(nextAccessToken);
      setAccessToken(nextAccessToken);
      queryClient.setQueryData([...authSessionQueryKey, nextAccessToken], {
        user
      });
    },
    [queryClient]
  );

  const setCurrentUser = useCallback(
    (user: PublicUser) => {
      if (!accessToken) {
        return;
      }

      queryClient.setQueryData([...authSessionQueryKey, accessToken], { user });
    },
    [accessToken, queryClient]
  );

  const logoutMutation = useMutation({
    mutationFn: async () => {
      if (!accessToken) {
        return;
      }

      await logout(accessToken);
    },
    onSettled: () => {
      clearSession();
    }
  });

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
      }
    };
  }, [
    accessToken,
    clearSession,
    logoutMutation,
    meQuery.data?.user,
    meQuery.isLoading,
    setCurrentUser,
    setSession
  ]);

  return <AuthSessionContext.Provider value={value}>{children}</AuthSessionContext.Provider>;
};
