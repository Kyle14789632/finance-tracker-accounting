import { useMemo, useState } from "react";
import { getApiErrorMessage } from "../../utils/api-errors";
import { useAuthSession } from "../auth/auth-session-context";
import { BalanceSheetSection } from "./components/BalanceSheetSection";
import { IncomeStatementSection } from "./components/IncomeStatementSection";
import { StatementsEmptyState } from "./components/StatementsEmptyState";
import { StatementsHeader } from "./components/StatementsHeader";
import { StatementsLoadingState } from "./components/StatementsLoadingState";
import { currentAsOfDate, currentMonth, type StatementsTab } from "./constants";
import { useBalanceSheetQuery, useIncomeStatementQuery } from "./hooks/useStatementQueries";

export const StatementsPage = () => {
  const { accessToken, user } = useAuthSession();
  const [activeTab, setActiveTab] = useState<StatementsTab>("income-statement");
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [asOfDate, setAsOfDate] = useState(currentAsOfDate);

  const currencyFormatter = useMemo(() => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: user?.currency ?? "PHP",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }, [user?.currency]);

  const incomeStatementQuery = useIncomeStatementQuery(
    accessToken,
    selectedMonth,
    Boolean(accessToken) && activeTab === "income-statement",
  );

  const balanceSheetQuery = useBalanceSheetQuery(
    accessToken,
    asOfDate,
    Boolean(accessToken) && activeTab === "balance-sheet",
  );

  const incomeStatement = incomeStatementQuery.data?.statement;
  const balanceSheet = balanceSheetQuery.data?.statement;
  const activeQuery = activeTab === "income-statement" ? incomeStatementQuery : balanceSheetQuery;

  const errorMessage = activeQuery.isError
    ? getApiErrorMessage(activeQuery.error, "Failed to load statement data.")
    : null;

  const hasNoIncomeData =
    incomeStatement !== undefined &&
    incomeStatement.totalIncome === "0.00" &&
    incomeStatement.totalExpenses === "0.00" &&
    incomeStatement.breakdownIncome.length === 0 &&
    incomeStatement.breakdownExpenses.length === 0;

  const hasNoBalanceData =
    balanceSheet !== undefined &&
    balanceSheet.totalAssets === "0.00" &&
    balanceSheet.equity === "0.00" &&
    balanceSheet.assets.every((asset) => asset.balance === "0.00");

  const isInitialLoading =
    activeTab === "income-statement"
      ? !incomeStatement && incomeStatementQuery.isLoading
      : !balanceSheet && balanceSheetQuery.isLoading;

  return (
    <>
      <StatementsHeader
        activeTab={activeTab}
        selectedMonth={selectedMonth}
        asOfDate={asOfDate}
        onTabChange={setActiveTab}
        onMonthChange={setSelectedMonth}
        onAsOfDateChange={setAsOfDate}
      />

      {errorMessage ? (
        <section className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-base text-rose-700">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span>{errorMessage}</span>
            <button
              type="button"
              onClick={() => {
                if (activeTab === "income-statement") {
                  void incomeStatementQuery.refetch();
                } else {
                  void balanceSheetQuery.refetch();
                }
              }}
              className="rounded-lg border border-rose-200 bg-white px-3 py-1.5 text-sm font-medium text-rose-700 hover:bg-rose-100"
            >
              Retry
            </button>
          </div>
        </section>
      ) : null}

      {isInitialLoading ? <StatementsLoadingState /> : null}

      {!isInitialLoading && activeTab === "income-statement" && hasNoIncomeData ? (
        <StatementsEmptyState
          title="No income statement data yet"
          description={`Add transactions for ${selectedMonth} to generate your monthly statement.`}
        />
      ) : null}

      {!isInitialLoading && activeTab === "balance-sheet" && hasNoBalanceData ? (
        <StatementsEmptyState
          title="No balance sheet data yet"
          description="Create an account and add transactions to compute assets and equity."
        />
      ) : null}

      {!isInitialLoading &&
      activeTab === "income-statement" &&
      !hasNoIncomeData &&
      incomeStatement ? (
        <IncomeStatementSection statement={incomeStatement} currencyFormatter={currencyFormatter} />
      ) : null}

      {!isInitialLoading && activeTab === "balance-sheet" && !hasNoBalanceData && balanceSheet ? (
        <BalanceSheetSection statement={balanceSheet} currencyFormatter={currencyFormatter} />
      ) : null}
    </>
  );
};
