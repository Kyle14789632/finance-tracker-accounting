import { useQuery } from "@tanstack/react-query";
import { CalendarDays } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { MonthPickerField } from "../../components/ui/MonthPickerField";
import { getApiErrorMessage } from "../../utils/api-errors";
import { centsToDisplayNumber, formatMoneyCents, moneyStringToCents } from "../../utils/money";
import { useAuthSession } from "../auth/auth-session-context";
import { getCategoryBreakdown, getMonthlySummary } from "./api";

const currentMonth = new Date().toISOString().slice(0, 7);

const chartPalette = ["#4b86c0", "#7ba989", "#94a3b8", "#93c5fd", "#86efac", "#c4b5fd"];

type KpiTone = "income" | "expense" | "net-positive" | "net-negative";

type KpiCardProps = {
  label: string;
  value: string;
  subtitle: string;
  tone: KpiTone;
};

const kpiToneClass: Record<KpiTone, string> = {
  income: "border-sage-100 bg-sage-100/40 text-emerald-900",
  expense: "border-primary-100 bg-primary-50 text-primary-900",
  "net-positive": "border-emerald-200 bg-emerald-50 text-emerald-900",
  "net-negative": "border-rose-200 bg-rose-50 text-rose-900",
};

const KpiCard = ({ label, value, subtitle, tone }: KpiCardProps) => (
  <article className={`rounded-2xl border p-4 ${kpiToneClass[tone]}`}>
    <p className="text-sm font-medium uppercase tracking-wide">{label}</p>
    <p className="mt-2 text-2xl font-semibold">{value}</p>
    <p className="mt-1 text-sm text-slate-600">{subtitle}</p>
  </article>
);

const DashboardLoadingState = () => (
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

    <div className="grid gap-4 xl:grid-cols-2">
      {Array.from({ length: 2 }).map((_, index) => (
        <div key={index} className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5">
          <div className="h-4 w-44 rounded bg-slate-200" />
          <div className="mt-5 h-64 rounded-xl bg-slate-100" />
        </div>
      ))}
    </div>
  </section>
);

const toShortLabel = (value: string): string => {
  if (value.length <= 16) {
    return value;
  }

  return `${value.slice(0, 13)}...`;
};

export const DashboardPage = () => {
  const { accessToken, user } = useAuthSession();
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);

  const monthlySummaryQuery = useQuery({
    queryKey: ["reports", "monthly-summary", selectedMonth],
    enabled: Boolean(accessToken),
    queryFn: () => getMonthlySummary(accessToken as string, { month: selectedMonth }),
  });

  const expenseBreakdownQuery = useQuery({
    queryKey: ["reports", "category-breakdown", selectedMonth, "EXPENSE"],
    enabled: Boolean(accessToken),
    queryFn: () =>
      getCategoryBreakdown(accessToken as string, {
        month: selectedMonth,
        type: "EXPENSE",
      }),
  });

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
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Monthly overview</h2>
            <p className="mt-1 text-base text-slate-600">
              Review total income, spending, and expense mix for a selected month.
            </p>
          </div>

          <MonthPickerField
            value={selectedMonth}
            onChange={setSelectedMonth}
            icon={CalendarDays}
            ariaLabel="Select month"
            className="sm:w-64"
          />
        </div>
      </section>

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
        <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-8 text-center">
          <h3 className="text-lg font-semibold text-slate-900">No report data yet</h3>
          <p className="mt-2 text-base text-slate-600">
            Add your first transaction for {selectedMonth} to populate dashboard totals and charts.
          </p>
          <Link
            to="/app/transactions"
            className="mt-5 inline-flex rounded-xl bg-primary-600 px-4 py-2 text-base font-medium text-white hover:bg-primary-700"
          >
            Add first transaction
          </Link>
        </section>
      ) : null}

      {!isInitialLoading && !hasNoData && summary && expenseBreakdown ? (
        <section className="mt-4 space-y-4">
          <div className="grid gap-3 md:grid-cols-3">
            <KpiCard
              label="Total income"
              value={formatMoneyCents(currencyFormatter, totalIncome)}
              subtitle="Money coming into your asset accounts"
              tone="income"
            />
            <KpiCard
              label="Total expense"
              value={formatMoneyCents(currencyFormatter, totalExpense)}
              subtitle="Money spent during the selected month"
              tone="expense"
            />
            <KpiCard
              label="Net"
              value={formatMoneyCents(currencyFormatter, net)}
              subtitle={
                net >= 0n
                  ? "You stayed cash-positive this month"
                  : "Expenses exceeded income this month"
              }
              tone={net >= 0n ? "net-positive" : "net-negative"}
            />
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="text-base font-semibold text-slate-900">Expense breakdown (pie)</h3>
              <p className="mt-1 text-sm text-slate-600">
                Category share of total monthly expenses.
              </p>

              {expenseChartData.length === 0 ? (
                <p className="mt-6 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-base text-slate-600">
                  No expense categories for this month.
                </p>
              ) : (
                <div className="mt-4 h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={expenseChartData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        innerRadius={58}
                        paddingAngle={2}
                      >
                        {expenseChartData.map((entry) => (
                          <Cell key={entry.id} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number | string | undefined) =>
                          currencyFormatter.format(Number(value ?? 0))
                        }
                      />
                      <Legend verticalAlign="bottom" height={30} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="text-base font-semibold text-slate-900">Expense breakdown (bar)</h3>
              <p className="mt-1 text-sm text-slate-600">Absolute spending amount by category.</p>

              {expenseChartData.length === 0 ? (
                <p className="mt-6 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-base text-slate-600">
                  No expense categories for this month.
                </p>
              ) : (
                <div className="mt-4 h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={expenseChartData}
                      margin={{ top: 8, right: 8, left: 8, bottom: 30 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                      <XAxis
                        dataKey="shortName"
                        angle={-20}
                        textAnchor="end"
                        interval={0}
                        tick={{ fontSize: 13, fill: "#64748b" }}
                      />
                      <YAxis
                        tickFormatter={(value) => currencyFormatter.format(Number(value))}
                        tick={{ fontSize: 13, fill: "#64748b" }}
                        width={96}
                      />
                      <Tooltip
                        formatter={(value: number | string | undefined) =>
                          currencyFormatter.format(Number(value ?? 0))
                        }
                        labelFormatter={(_, payload) => payload?.[0]?.payload?.name ?? ""}
                      />
                      <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                        {expenseChartData.map((entry) => (
                          <Cell key={`${entry.id}-bar`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </section>
          </div>
        </section>
      ) : null}
    </>
  );
};

