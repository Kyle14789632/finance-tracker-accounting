type MetricCardProps = {
  label: string;
  value: string;
  subtitle: string;
  tone: "income" | "expense" | "net" | "asset" | "equity";
};

const metricToneClass: Record<MetricCardProps["tone"], string> = {
  income: "border-sage-100 bg-sage-100/40 text-emerald-900",
  expense: "border-primary-100 bg-primary-50 text-primary-900",
  net: "border-emerald-200 bg-emerald-50 text-emerald-900",
  asset: "border-sky-200 bg-sky-50 text-sky-900",
  equity: "border-indigo-200 bg-indigo-50 text-indigo-900",
};

export const MetricCard = ({ label, value, subtitle, tone }: MetricCardProps) => (
  <article className={`rounded-2xl border p-4 ${metricToneClass[tone]}`}>
    <p className="text-sm font-medium uppercase tracking-wide text-slate-500">{label}</p>
    <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
    <p className="mt-1 text-sm text-slate-600">{subtitle}</p>
  </article>
);
