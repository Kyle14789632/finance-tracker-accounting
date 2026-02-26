import { ChevronDown, ChevronLeft, ChevronRight, type LucideIcon } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

type DatePickerFieldProps = {
  value: string;
  onChange: (value: string) => void;
  icon: LucideIcon;
  ariaLabel: string;
  className?: string;
};

type CalendarCell = {
  date: Date;
  isOutsideCurrentMonth: boolean;
};

const weekdayLabels = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

const padNumber = (value: number): string => String(value).padStart(2, "0");

const toDateValue = (date: Date): string =>
  `${date.getFullYear()}-${padNumber(date.getMonth() + 1)}-${padNumber(date.getDate())}`;

const parseDateValue = (value: string): Date => {
  const parsed = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

  if (!parsed) {
    return new Date();
  }

  const year = Number(parsed[1]);
  const month = Number(parsed[2]) - 1;
  const day = Number(parsed[3]);
  const candidate = new Date(year, month, day);

  if (Number.isNaN(candidate.getTime())) {
    return new Date();
  }

  return candidate;
};

const buildCalendarCells = (viewYear: number, viewMonth: number): CalendarCell[] => {
  const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay();
  const daysInCurrentMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const daysInPreviousMonth = new Date(viewYear, viewMonth, 0).getDate();
  const calendarCells: CalendarCell[] = [];

  for (let index = 0; index < 42; index += 1) {
    if (index < firstDayIndex) {
      const date = new Date(
        viewYear,
        viewMonth - 1,
        daysInPreviousMonth - firstDayIndex + index + 1,
      );
      calendarCells.push({ date, isOutsideCurrentMonth: true });
      continue;
    }

    if (index < firstDayIndex + daysInCurrentMonth) {
      const date = new Date(viewYear, viewMonth, index - firstDayIndex + 1);
      calendarCells.push({ date, isOutsideCurrentMonth: false });
      continue;
    }

    const date = new Date(viewYear, viewMonth + 1, index - firstDayIndex - daysInCurrentMonth + 1);
    calendarCells.push({ date, isOutsideCurrentMonth: true });
  }

  return calendarCells;
};

export const DatePickerField = ({
  value,
  onChange,
  icon: Icon,
  ariaLabel,
  className,
}: DatePickerFieldProps) => {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const selectedDate = parseDateValue(value);
  const [viewDate, setViewDate] = useState(
    new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1),
  );

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleOutsideClick = (event: MouseEvent) => {
      if (!rootRef.current) {
        return;
      }

      if (!rootRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setViewDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));
  }, [isOpen, selectedDate]);

  const calendarCells = useMemo(
    () => buildCalendarCells(viewDate.getFullYear(), viewDate.getMonth()),
    [viewDate],
  );

  const displayLabel = useMemo(() => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    }).format(selectedDate);
  }, [selectedDate]);

  const todayValue = toDateValue(new Date());
  const selectedValue = toDateValue(selectedDate);

  return (
    <div ref={rootRef} className={`relative ${className ?? ""}`}>
      <button
        type="button"
        aria-label={ariaLabel}
        onClick={() => setIsOpen((open) => !open)}
        className="grid h-[42px] w-full grid-cols-[auto,1fr,auto] overflow-hidden rounded-xl border border-slate-300 bg-white text-left transition hover:border-slate-400 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
      >
        <span className="inline-flex items-center border-r border-slate-200 bg-slate-50 px-3 text-primary-600">
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
        <span className="truncate px-3 py-2.5 text-base text-slate-700">{displayLabel}</span>
        <span className="inline-flex items-center px-3 text-slate-500">
          <ChevronDown className={`h-4 w-4 transition ${isOpen ? "rotate-180" : "rotate-0"}`} aria-hidden="true" />
        </span>
      </button>

      {isOpen ? (
        <section className="absolute right-0 z-50 mt-2 w-[19rem] rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <button
              type="button"
              onClick={() =>
                setViewDate((currentDate) =>
                  new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1),
                )
              }
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
              aria-label="Previous month"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </button>
            <p className="text-sm font-semibold text-slate-800">
              {new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(viewDate)}
            </p>
            <button
              type="button"
              onClick={() =>
                setViewDate((currentDate) =>
                  new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1),
                )
              }
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
              aria-label="Next month"
            >
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 px-1 pb-2">
            {weekdayLabels.map((weekdayLabel) => (
              <span key={weekdayLabel} className="text-center text-xs font-medium text-slate-500">
                {weekdayLabel}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {calendarCells.map((calendarCell) => {
              const cellValue = toDateValue(calendarCell.date);
              const isSelected = cellValue === selectedValue;
              const isToday = cellValue === todayValue;

              return (
                <button
                  key={cellValue}
                  type="button"
                  onClick={() => {
                    onChange(cellValue);
                    setIsOpen(false);
                  }}
                  className={[
                    "h-9 rounded-lg text-sm font-medium transition",
                    isSelected
                      ? "bg-primary-600 text-white hover:bg-primary-700"
                      : calendarCell.isOutsideCurrentMonth
                        ? "text-slate-400 hover:bg-slate-50"
                        : "text-slate-700 hover:bg-slate-100",
                    !isSelected && isToday ? "border border-primary-200" : "",
                  ].join(" ")}
                >
                  {calendarCell.date.getDate()}
                </button>
              );
            })}
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
            <button
              type="button"
              onClick={() => {
                onChange(toDateValue(new Date()));
                setIsOpen(false);
              }}
              className="text-sm font-medium text-primary-700 hover:text-primary-800"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-sm font-medium text-slate-600 hover:text-slate-800"
            >
              Close
            </button>
          </div>
        </section>
      ) : null}
    </div>
  );
};
