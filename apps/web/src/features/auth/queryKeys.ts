export const authQueryKeys = {
  base: ["auth", "me"] as const,
  session: (accessToken: string | null) => ["auth", "me", accessToken] as const,
};
