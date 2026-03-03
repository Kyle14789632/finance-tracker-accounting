import { useQuery } from "@tanstack/react-query";
import type { AccountType } from "@sft/shared";
import { getAccounts } from "../api";
import { accountsQueryKeys } from "../queryKeys";

export const useAccountsQuery = (
  accessToken: string | null,
  activeTypeFilter: "ALL" | AccountType,
) => {
  return useQuery({
    queryKey: accountsQueryKeys.list(activeTypeFilter),
    enabled: Boolean(accessToken),
    queryFn: () =>
      getAccounts(
        accessToken as string,
        activeTypeFilter === "ALL" ? {} : { type: activeTypeFilter },
      ),
  });
};
