import { CalendarDays } from "lucide-react";
import { MonthPickerField } from "../../../components/ui/MonthPickerField";

type DashboardHeaderProps = {
  selectedMonth: string;
  onMonthChange: (nextMonth: string) => void;
};

export const DashboardHeader = ({ selectedMonth, onMonthChange }: DashboardHeaderProps) => (
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
        onChange={onMonthChange}
        icon={CalendarDays}
        ariaLabel="Select month"
        className="sm:w-64"
      />
    </div>
  </section>
);
