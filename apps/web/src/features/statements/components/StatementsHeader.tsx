import { Calendar, CalendarDays, FileSpreadsheet } from "lucide-react";
import { DatePickerField } from "../../../components/ui/DatePickerField";
import { MonthPickerField } from "../../../components/ui/MonthPickerField";
import { SelectMenuField } from "../../../components/ui/SelectMenuField";
import { FilterField } from "../../shared/crud/components/FilterField";
import { statementsTabOptions, type StatementsTab } from "../constants";

type StatementsHeaderProps = {
  activeTab: StatementsTab;
  selectedMonth: string;
  asOfDate: string;
  onTabChange: (nextTab: StatementsTab) => void;
  onMonthChange: (nextMonth: string) => void;
  onAsOfDateChange: (nextDate: string) => void;
};

export const StatementsHeader = ({
  activeTab,
  selectedMonth,
  asOfDate,
  onTabChange,
  onMonthChange,
  onAsOfDateChange,
}: StatementsHeaderProps) => (
  <section className="rounded-2xl border border-slate-200 bg-white p-5">
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Financial statements</h2>
        <p className="mt-1 text-base text-slate-600">
          Review performance by month and your simplified balance sheet as of a specific date.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <FilterField icon={FileSpreadsheet} className="min-w-[13rem]">
          <SelectMenuField
            ariaLabel="Select statement type"
            value={activeTab}
            onChange={(nextValue) => onTabChange(nextValue as StatementsTab)}
            options={statementsTabOptions}
            variant="plain"
            menuClassName="left-0 right-0"
          />
        </FilterField>

        {activeTab === "income-statement" ? (
          <MonthPickerField
            value={selectedMonth}
            onChange={onMonthChange}
            icon={CalendarDays}
            ariaLabel="Select income statement month"
          />
        ) : (
          <DatePickerField
            value={asOfDate}
            onChange={onAsOfDateChange}
            icon={Calendar}
            ariaLabel="Select balance sheet date"
          />
        )}
      </div>
    </div>
  </section>
);
