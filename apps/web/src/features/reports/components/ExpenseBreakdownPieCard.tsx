import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { ExpenseChartDatum } from "../constants";

type ExpenseBreakdownPieCardProps = {
  expenseChartData: ExpenseChartDatum[];
  currencyFormatter: Intl.NumberFormat;
};

export const ExpenseBreakdownPieCard = ({
  expenseChartData,
  currencyFormatter,
}: ExpenseBreakdownPieCardProps) => (
  <section className="rounded-2xl border border-slate-200 bg-white p-5">
    <h3 className="text-base font-semibold text-slate-900">Expense breakdown (pie)</h3>
    <p className="mt-1 text-sm text-slate-600">Category share of total monthly expenses.</p>

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
);
