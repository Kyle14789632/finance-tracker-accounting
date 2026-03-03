import { formatMoneyCents } from "../../../utils/money";
import type { ExpenseChartDatum } from "../constants";
import { ExpenseBreakdownBarCard } from "./ExpenseBreakdownBarCard";
import { ExpenseBreakdownPieCard } from "./ExpenseBreakdownPieCard";
import { KpiCard } from "./KpiCard";

type DashboardContentSectionProps = {
  totalIncome: bigint;
  totalExpense: bigint;
  net: bigint;
  currencyFormatter: Intl.NumberFormat;
  expenseChartData: ExpenseChartDatum[];
};

export const DashboardContentSection = ({
  totalIncome,
  totalExpense,
  net,
  currencyFormatter,
  expenseChartData,
}: DashboardContentSectionProps) => (
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
          net >= 0n ? "You stayed cash-positive this month" : "Expenses exceeded income this month"
        }
        tone={net >= 0n ? "net-positive" : "net-negative"}
      />
    </div>

    <div className="grid gap-4 xl:grid-cols-2">
      <ExpenseBreakdownPieCard
        expenseChartData={expenseChartData}
        currencyFormatter={currencyFormatter}
      />
      <ExpenseBreakdownBarCard
        expenseChartData={expenseChartData}
        currencyFormatter={currencyFormatter}
      />
    </div>
  </section>
);
