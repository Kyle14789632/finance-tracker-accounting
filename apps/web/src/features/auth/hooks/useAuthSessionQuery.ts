import { useQuery } from "@tanstack/react-query";
import { getMe } from "../api";
import { authQueryKeys } from "../queryKeys";

export const useAuthSessionQuery = (accessToken: string | null) => {
  return useQuery({
    queryKey: authQueryKeys.session(accessToken),
    queryFn: () => getMe(accessToken as string),
    enabled: Boolean(accessToken),
    retry: false,
    staleTime: 60_000,
  });
};
