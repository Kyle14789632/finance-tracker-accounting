import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ExpenseChartDatum } from "../constants";

type ExpenseBreakdownBarCardProps = {
  expenseChartData: ExpenseChartDatum[];
  currencyFormatter: Intl.NumberFormat;
};

export const ExpenseBreakdownBarCard = ({
  expenseChartData,
  currencyFormatter,
}: ExpenseBreakdownBarCardProps) => (
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
          <BarChart data={expenseChartData} margin={{ top: 8, right: 8, left: 8, bottom: 30 }}>
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
);
