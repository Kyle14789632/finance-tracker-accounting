import { useMemo, useState } from "react";
import { getApiErrorMessage } from "../../utils/api-errors";
import { centsToDisplayNumber, moneyStringToCents } from "../../utils/money";
import { useAuthSession } from "../auth/auth-session-context";
import { DashboardContentSection } from "./components/DashboardContentSection";
import { DashboardEmptyState } from "./components/DashboardEmptyState";
import { DashboardHeader } from "./components/DashboardHeader";
import { DashboardLoadingState } from "./components/DashboardLoadingState";
import { chartPalette, currentMonth, toShortLabel } from "./constants";
import { useCategoryBreakdownQuery, useMonthlySummaryQuery } from "./hooks/useReportQueries";

export const DashboardPage = () => {
  const { accessToken, user } = useAuthSession();
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);

  const monthlySummaryQuery = useMonthlySummaryQuery(accessToken, selectedMonth);
  const expenseBreakdownQuery = useCategoryBreakdownQuery(accessToken, selectedMonth, "EXPENSE");

  const summary = monthlySummaryQuery.data?.summary;
  const expenseBreakdown = expenseBreakdownQuery.data?.breakdown;

  const currencyFormatter = useMemo(() => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: user?.currency ?? "PHP",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }, [user?.currency]);

  const expenseChartData = useMemo(() => {
    const categories = expenseBreakdown?.categories ?? [];

    return categories.map((item, index) => ({
      id: item.categoryId,
      name: item.categoryName,
      shortName: toShortLabel(item.categoryName),
      value: centsToDisplayNumber(moneyStringToCents(item.total)),
      fill: chartPalette[index % chartPalette.length],
    }));
  }, [expenseBreakdown?.categories]);

  const isInitialLoading =
    (!summary || !expenseBreakdown) &&
    (monthlySummaryQuery.isLoading || expenseBreakdownQuery.isLoading);

  const errorMessage = monthlySummaryQuery.isError
    ? getApiErrorMessage(monthlySummaryQuery.error, "Failed to load dashboard data.")
    : expenseBreakdownQuery.isError
      ? getApiErrorMessage(expenseBreakdownQuery.error, "Failed to load dashboard data.")
      : null;

  const hasNoData =
    summary !== undefined &&
    expenseBreakdown !== undefined &&
    summary.totalIncome === "0.00" &&
    summary.totalExpense === "0.00" &&
    expenseBreakdown.categories.length === 0;

  const totalIncome = summary ? moneyStringToCents(summary.totalIncome) : 0n;
  const totalExpense = summary ? moneyStringToCents(summary.totalExpense) : 0n;
  const net = summary ? moneyStringToCents(summary.net) : 0n;

  return (
    <>
      <DashboardHeader selectedMonth={selectedMonth} onMonthChange={setSelectedMonth} />

      {errorMessage ? (
        <section className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-base text-rose-700">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span>{errorMessage}</span>
            <button
              type="button"
              onClick={() => {
                void monthlySummaryQuery.refetch();
                void expenseBreakdownQuery.refetch();
              }}
              className="rounded-lg border border-rose-200 bg-white px-3 py-1.5 text-sm font-medium text-rose-700 hover:bg-rose-100"
            >
              Retry
            </button>
          </div>
        </section>
      ) : null}

      {isInitialLoading ? <DashboardLoadingState /> : null}

      {!isInitialLoading && hasNoData ? (
        <DashboardEmptyState selectedMonth={selectedMonth} />
      ) : null}

      {!isInitialLoading && !hasNoData && summary && expenseBreakdown ? (
        <DashboardContentSection
          totalIncome={totalIncome}
          totalExpense={totalExpense}
          net={net}
          currencyFormatter={currencyFormatter}
          expenseChartData={expenseChartData}
        />
      ) : null}
    </>
  );
};
