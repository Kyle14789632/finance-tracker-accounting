import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getApiErrorMessage } from "../../utils/api-errors";
import { formatMoneyString } from "../../utils/money";
import { useAuthSession } from "../auth/auth-session-context";
import { getBalanceSheet, getIncomeStatement } from "./api";

const currentMonth = new Date().toISOString().slice(0, 7);
const currentAsOfDate = new Date().toISOString().slice(0, 10);

type StatementsTab = "income-statement" | "balance-sheet";

type MetricCardProps = {
  label: string;
  value: string;
  subtitle: string;
};

const MetricCard = ({ label, value, subtitle }: MetricCardProps) => (
  <article className="rounded-2xl border border-slate-200 bg-white p-4">
    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
    <p className="mt-2 text-xl font-semibold text-slate-900">{value}</p>
    <p className="mt-1 text-xs text-slate-600">{subtitle}</p>
  </article>
);

const StatementsLoadingState = () => (
  <section className="mt-4 space-y-4">
    <div className="grid gap-3 md:grid-cols-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="animate-pulse rounded-2xl border border-slate-200 bg-white p-4">
          <div className="h-3 w-20 rounded bg-slate-200" />
          <div className="mt-3 h-6 w-28 rounded bg-slate-300" />
          <div className="mt-2 h-3 w-32 rounded bg-slate-100" />
        </div>
      ))}
    </div>

    <div className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5">
      <div className="h-4 w-48 rounded bg-slate-200" />
      <div className="mt-4 space-y-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-9 rounded-xl bg-slate-100" />
        ))}
      </div>
    </div>
  </section>
);

const BreakdownTable = ({
  title,
  subtitle,
  items,
  currencyFormatter
}: {
  title: string;
  subtitle: string;
  items: Array<{ categoryId: string; categoryName: string; total: string }>;
  currencyFormatter: Intl.NumberFormat;
}) => (
  <section className="rounded-2xl border border-slate-200 bg-white p-5">
    <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
    <p className="mt-1 text-xs text-slate-600">{subtitle}</p>

    {items.length === 0 ? (
      <p className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
        No categories for this period.
      </p>
    ) : (
      <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Category</th>
              <th className="px-3 py-2 text-right text-xs font-medium uppercase tracking-wide text-slate-500">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {items.map((item) => (
              <tr key={item.categoryId}>
                <td className="px-3 py-2 text-sm text-slate-700">{item.categoryName}</td>
                <td className="px-3 py-2 text-right text-sm font-medium text-slate-900">
                  {formatMoneyString(currencyFormatter, item.total)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </section>
);

const tabButtonClass = (isActive: boolean): string =>
  [
    "rounded-xl px-3 py-2 text-sm font-medium transition",
    isActive
      ? "border border-primary-200 bg-primary-100 text-primary-700"
      : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-800"
  ].join(" ");

export const StatementsPage = () => {
  const { accessToken, user } = useAuthSession();
  const [activeTab, setActiveTab] = useState<StatementsTab>("income-statement");
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [asOfDate, setAsOfDate] = useState(currentAsOfDate);

  const currencyFormatter = useMemo(() => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: user?.currency ?? "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }, [user?.currency]);

  const incomeStatementQuery = useQuery({
    queryKey: ["reports", "income-statement", selectedMonth],
    enabled: Boolean(accessToken) && activeTab === "income-statement",
    queryFn: () => getIncomeStatement(accessToken as string, { month: selectedMonth })
  });

  const balanceSheetQuery = useQuery({
    queryKey: ["reports", "balance-sheet", asOfDate],
    enabled: Boolean(accessToken) && activeTab === "balance-sheet",
    queryFn: () => getBalanceSheet(accessToken as string, { asOf: asOfDate })
  });

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
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Financial statements</h2>
            <p className="mt-1 text-sm text-slate-600">
              Review performance by month and your simplified balance sheet as of a specific date.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setActiveTab("income-statement")}
                className={tabButtonClass(activeTab === "income-statement")}
              >
                Income Statement
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("balance-sheet")}
                className={tabButtonClass(activeTab === "balance-sheet")}
              >
                Balance Sheet
              </button>
            </div>

            {activeTab === "income-statement" ? (
              <label className="block min-w-40">
                <span className="text-xs font-medium uppercase tracking-wide text-slate-500">Month</span>
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(event) => setSelectedMonth(event.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                />
              </label>
            ) : (
              <label className="block min-w-40">
                <span className="text-xs font-medium uppercase tracking-wide text-slate-500">As of date</span>
                <input
                  type="date"
                  value={asOfDate}
                  onChange={(event) => setAsOfDate(event.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                />
              </label>
            )}
          </div>
        </div>
      </section>

      <section className="mt-4 rounded-2xl border border-primary-100 bg-primary-50/70 px-4 py-3 text-sm text-primary-800">
        {activeTab === "income-statement" ? (
          <p>
            Income Statement shows monthly income and expenses; net income is the difference between the two totals.
          </p>
        ) : (
          <p>
            Balance Sheet shows assets as of a date; equity uses cumulative net income up to that date for MVP.
          </p>
        )}
      </section>

      {errorMessage ? (
        <section className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
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
              className="rounded-lg border border-rose-200 bg-white px-3 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-100"
            >
              Retry
            </button>
          </div>
        </section>
      ) : null}

      {isInitialLoading ? <StatementsLoadingState /> : null}

      {!isInitialLoading && activeTab === "income-statement" && hasNoIncomeData ? (
        <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-8 text-center">
          <h3 className="text-base font-semibold text-slate-900">No income statement data yet</h3>
          <p className="mt-2 text-sm text-slate-600">
            Add transactions for {selectedMonth} to generate your monthly statement.
          </p>
          <Link
            to="/app/transactions"
            className="mt-5 inline-flex rounded-xl bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
          >
            Add first transaction
          </Link>
        </section>
      ) : null}

      {!isInitialLoading && activeTab === "balance-sheet" && hasNoBalanceData ? (
        <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-8 text-center">
          <h3 className="text-base font-semibold text-slate-900">No balance sheet data yet</h3>
          <p className="mt-2 text-sm text-slate-600">
            Create an account and add transactions to compute assets and equity.
          </p>
          <Link
            to="/app/transactions"
            className="mt-5 inline-flex rounded-xl bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
          >
            Add first transaction
          </Link>
        </section>
      ) : null}

      {!isInitialLoading && activeTab === "income-statement" && !hasNoIncomeData && incomeStatement ? (
        <section className="mt-4 space-y-4">
          <div className="grid gap-3 md:grid-cols-3">
            <MetricCard
              label="Total income"
              value={formatMoneyString(currencyFormatter, incomeStatement.totalIncome)}
              subtitle="All income categories in selected month"
            />
            <MetricCard
              label="Total expenses"
              value={formatMoneyString(currencyFormatter, incomeStatement.totalExpenses)}
              subtitle="All expense categories in selected month"
            />
            <MetricCard
              label="Net income"
              value={formatMoneyString(currencyFormatter, incomeStatement.netIncome)}
              subtitle="Monthly performance (income - expenses)"
            />
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <BreakdownTable
              title="Income breakdown"
              subtitle="Grouped by income categories."
              items={incomeStatement.breakdownIncome}
              currencyFormatter={currencyFormatter}
            />
            <BreakdownTable
              title="Expense breakdown"
              subtitle="Grouped by expense categories."
              items={incomeStatement.breakdownExpenses}
              currencyFormatter={currencyFormatter}
            />
          </div>
        </section>
      ) : null}

      {!isInitialLoading && activeTab === "balance-sheet" && !hasNoBalanceData && balanceSheet ? (
        <section className="mt-4 space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            <MetricCard
              label="Total assets"
              value={formatMoneyString(currencyFormatter, balanceSheet.totalAssets)}
              subtitle="Sum of all account balances as of selected date"
            />
            <MetricCard
              label="Equity"
              value={formatMoneyString(currencyFormatter, balanceSheet.equity)}
              subtitle="Cumulative net income to date (MVP)"
            />
          </div>

          <section className="rounded-2xl border border-sage-100 bg-sage-100/50 px-4 py-3 text-sm text-emerald-900">
            <p>
              Simplified equation check: <strong>Assets = Equity</strong>. Liabilities are omitted in MVP.
            </p>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="text-sm font-semibold text-slate-900">Asset balances</h3>
            <p className="mt-1 text-xs text-slate-600">Per-account balances as of {balanceSheet.asOf}.</p>

            {balanceSheet.assets.length === 0 ? (
              <p className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                No accounts found for this user.
              </p>
            ) : (
              <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Account</th>
                      <th className="px-3 py-2 text-right text-xs font-medium uppercase tracking-wide text-slate-500">Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {balanceSheet.assets.map((asset) => (
                      <tr key={asset.accountId}>
                        <td className="px-3 py-2 text-sm text-slate-700">{asset.accountName}</td>
                        <td className="px-3 py-2 text-right text-sm font-medium text-slate-900">
                          {formatMoneyString(currencyFormatter, asset.balance)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <p className="mt-4 text-xs text-slate-500">
              Equity definition: <code>{balanceSheet.equityDefinition}</code>
            </p>
          </section>
        </section>
      ) : null}
    </>
  );
};
