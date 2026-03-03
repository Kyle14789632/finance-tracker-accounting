export const statementsQueryKeys = {
  incomeStatement: (month: string) => ["reports", "income-statement", month] as const,
  balanceSheet: (asOfDate: string) => ["reports", "balance-sheet", asOfDate] as const,
};
