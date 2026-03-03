import type { BalanceSheet } from "@sft/shared";
import { formatMoneyString } from "../../../utils/money";
import { MetricCard } from "./MetricCard";

type BalanceSheetSectionProps = {
  statement: BalanceSheet;
  currencyFormatter: Intl.NumberFormat;
};

export const BalanceSheetSection = ({ statement, currencyFormatter }: BalanceSheetSectionProps) => (
  <section className="mt-4 space-y-4">
    <div className="grid gap-3 md:grid-cols-2">
      <MetricCard
        label="Total assets"
        value={formatMoneyString(currencyFormatter, statement.totalAssets)}
        subtitle="Sum of all account balances as of selected date"
        tone="asset"
      />
      <MetricCard
        label="Equity"
        value={formatMoneyString(currencyFormatter, statement.equity)}
        subtitle="Cumulative net income to date"
        tone="equity"
      />
    </div>

    <section className="rounded-2xl border border-slate-200 bg-white p-5">
      <h3 className="text-base font-semibold text-slate-900">Asset balances</h3>
      <p className="mt-1 text-sm text-slate-600">Per-account balances as of {statement.asOf}.</p>

      {statement.assets.length === 0 ? (
        <p className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-base text-slate-600">
          No accounts found for this user.
        </p>
      ) : (
        <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-3 py-2 text-left text-sm font-medium uppercase tracking-wide text-slate-500">
                  Account
                </th>
                <th className="px-3 py-2 text-right text-sm font-medium uppercase tracking-wide text-slate-500">
                  Balance
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {statement.assets.map((asset) => (
                <tr key={asset.accountId}>
                  <td className="px-3 py-2 text-base text-slate-700">{asset.accountName}</td>
                  <td className="px-3 py-2 text-right text-base font-medium text-slate-900">
                    {formatMoneyString(currencyFormatter, asset.balance)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  </section>
);
