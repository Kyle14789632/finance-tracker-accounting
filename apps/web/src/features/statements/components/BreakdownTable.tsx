import { formatMoneyString } from "../../../utils/money";

type BreakdownTableProps = {
  title: string;
  subtitle: string;
  items: Array<{ categoryId: string; categoryName: string; total: string }>;
  currencyFormatter: Intl.NumberFormat;
};

export const BreakdownTable = ({
  title,
  subtitle,
  items,
  currencyFormatter,
}: BreakdownTableProps) => (
  <section className="rounded-2xl border border-slate-200 bg-white p-5">
    <h3 className="text-base font-semibold text-slate-900">{title}</h3>
    <p className="mt-1 text-sm text-slate-600">{subtitle}</p>

    {items.length === 0 ? (
      <p className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-base text-slate-600">
        No categories for this period.
      </p>
    ) : (
      <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-3 py-2 text-left text-sm font-medium uppercase tracking-wide text-slate-500">
                Category
              </th>
              <th className="px-3 py-2 text-right text-sm font-medium uppercase tracking-wide text-slate-500">
                Total
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {items.map((item) => (
              <tr key={item.categoryId}>
                <td className="px-3 py-2 text-base text-slate-700">{item.categoryName}</td>
                <td className="px-3 py-2 text-right text-base font-medium text-slate-900">
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
