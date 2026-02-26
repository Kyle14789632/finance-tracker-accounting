import type { PublicUser } from "@sft/shared";
import { createContext, useContext } from "react";

export type AuthSessionContextValue = {
  accessToken: string | null;
  user: PublicUser | null;
  isSessionLoading: boolean;
  isAuthenticated: boolean;
  isLoggingOut: boolean;
  setSession: (accessToken: string, user: PublicUser) => void;
  setCurrentUser: (user: PublicUser) => void;
  clearSession: () => void;
  logoutSession: () => Promise<void>;
};

export const AuthSessionContext = createContext<AuthSessionContextValue | null>(null);

export const useAuthSession = (): AuthSessionContextValue => {
  const context = useContext(AuthSessionContext);

  if (!context) {
    throw new Error("useAuthSession must be used within AuthSessionProvider");
  }

  return context;
};
