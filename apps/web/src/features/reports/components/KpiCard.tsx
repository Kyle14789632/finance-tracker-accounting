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

export const KpiCard = ({ label, value, subtitle, tone }: KpiCardProps) => (
  <article className={`rounded-2xl border p-4 ${kpiToneClass[tone]}`}>
    <p className="text-sm font-medium uppercase tracking-wide">{label}</p>
    <p className="mt-2 text-2xl font-semibold">{value}</p>
    <p className="mt-1 text-sm text-slate-600">{subtitle}</p>
  </article>
);
