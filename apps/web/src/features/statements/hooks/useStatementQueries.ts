import { useQuery } from "@tanstack/react-query";
import { getBalanceSheet, getIncomeStatement } from "../api";
import { statementsQueryKeys } from "../queryKeys";

export const useIncomeStatementQuery = (
  accessToken: string | null,
  selectedMonth: string,
  enabled: boolean,
) => {
  return useQuery({
    queryKey: statementsQueryKeys.incomeStatement(selectedMonth),
    enabled,
    queryFn: () => getIncomeStatement(accessToken as string, { month: selectedMonth }),
  });
};

export const useBalanceSheetQuery = (
  accessToken: string | null,
  asOfDate: string,
  enabled: boolean,
) => {
  return useQuery({
    queryKey: statementsQueryKeys.balanceSheet(asOfDate),
    enabled,
    queryFn: () => getBalanceSheet(accessToken as string, { asOf: asOfDate }),
  });
};
