const ACCESS_TOKEN_STORAGE_KEY = "sft_access_token";

export const getStoredAccessToken = (): string | null => {
  if (typeof window === "undefined") {
    return null;
  }

  const token = window.localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
  return token && token.length > 0 ? token : null;
};

export const setStoredAccessToken = (token: string): void => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, token);
};

export const clearStoredAccessToken = (): void => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
};
