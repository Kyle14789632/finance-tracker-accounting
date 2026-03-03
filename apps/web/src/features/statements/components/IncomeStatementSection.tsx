import type { IncomeStatement } from "@sft/shared";
import { formatMoneyString } from "../../../utils/money";
import { BreakdownTable } from "./BreakdownTable";
import { MetricCard } from "./MetricCard";

type IncomeStatementSectionProps = {
  statement: IncomeStatement;
  currencyFormatter: Intl.NumberFormat;
};

export const IncomeStatementSection = ({
  statement,
  currencyFormatter,
}: IncomeStatementSectionProps) => (
  <section className="mt-4 space-y-4">
    <div className="grid gap-3 md:grid-cols-3">
      <MetricCard
        label="Total income"
        value={formatMoneyString(currencyFormatter, statement.totalIncome)}
        subtitle="All income categories in selected month"
        tone="income"
      />
      <MetricCard
        label="Total expenses"
        value={formatMoneyString(currencyFormatter, statement.totalExpenses)}
        subtitle="All expense categories in selected month"
        tone="expense"
      />
      <MetricCard
        label="Net income"
        value={formatMoneyString(currencyFormatter, statement.netIncome)}
        subtitle="Monthly performance (income - expenses)"
        tone="net"
      />
    </div>

    <div className="grid gap-4 xl:grid-cols-2">
      <BreakdownTable
        title="Income breakdown"
        subtitle="Grouped by income categories."
        items={statement.breakdownIncome}
        currencyFormatter={currencyFormatter}
      />
      <BreakdownTable
        title="Expense breakdown"
        subtitle="Grouped by expense categories."
        items={statement.breakdownExpenses}
        currencyFormatter={currencyFormatter}
      />
    </div>
  </section>
);
