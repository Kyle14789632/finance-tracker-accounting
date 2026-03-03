import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

type FilterFieldProps = {
  icon: LucideIcon;
  children: ReactNode;
  className?: string;
};

export const FilterField = ({ icon: Icon, children, className }: FilterFieldProps) => (
  <div
    className={[
      "grid min-w-60 grid-cols-[auto,1fr] rounded-xl border border-slate-300 bg-white transition focus-within:border-primary-400 focus-within:ring-2 focus-within:ring-primary-100",
      className ?? "",
    ].join(" ")}
  >
    <div className="inline-flex h-[42px] items-center rounded-l-xl border-r border-slate-200 bg-slate-50 px-3 text-primary-600">
      <Icon className="h-4 w-4" aria-hidden="true" />
    </div>
    <div className="min-w-0 flex-1">{children}</div>
  </div>
);
