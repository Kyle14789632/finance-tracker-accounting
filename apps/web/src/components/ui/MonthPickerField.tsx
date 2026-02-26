import { ChevronDown, ChevronLeft, ChevronRight, type LucideIcon } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

type MonthPickerFieldProps = {
  value: string;
  onChange: (value: string) => void;
  icon: LucideIcon;
  ariaLabel: string;
  className?: string;
};

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const getCurrentMonthValue = (): string => {
  const currentDate = new Date();
  const month = String(currentDate.getMonth() + 1).padStart(2, "0");
  return `${currentDate.getFullYear()}-${month}`;
};

const parseMonthValue = (value: string): { year: number; monthIndex: number } => {
  const parsed = /^(\d{4})-(\d{2})$/.exec(value);

  if (!parsed) {
    const currentDate = new Date();
    return { year: currentDate.getFullYear(), monthIndex: currentDate.getMonth() };
  }

  const year = Number(parsed[1]);
  const monthIndex = Number(parsed[2]) - 1;

  if (!Number.isInteger(year) || monthIndex < 0 || monthIndex > 11) {
    const currentDate = new Date();
    return { year: currentDate.getFullYear(), monthIndex: currentDate.getMonth() };
  }

  return { year, monthIndex };
};

const toMonthValue = (year: number, monthIndex: number): string =>
  `${year}-${String(monthIndex + 1).padStart(2, "0")}`;

export const MonthPickerField = ({
  value,
  onChange,
  icon: Icon,
  ariaLabel,
  className,
}: MonthPickerFieldProps) => {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const parsedValue = parseMonthValue(value);
  const [viewYear, setViewYear] = useState(parsedValue.year);

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

    setViewYear(parsedValue.year);
  }, [isOpen, parsedValue.year]);

  const displayLabel = useMemo(() => {
    return `${monthNames[parsedValue.monthIndex]} ${parsedValue.year}`;
  }, [parsedValue.monthIndex, parsedValue.year]);

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
              onClick={() => setViewYear((year) => year - 1)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
              aria-label="Previous year"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </button>
            <p className="text-sm font-semibold text-slate-800">{viewYear}</p>
            <button
              type="button"
              onClick={() => setViewYear((year) => year + 1)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
              aria-label="Next year"
            >
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {monthNames.map((monthName, monthIndex) => {
              const isSelected =
                parsedValue.year === viewYear && parsedValue.monthIndex === monthIndex;

              return (
                <button
                  key={monthName}
                  type="button"
                  onClick={() => {
                    onChange(toMonthValue(viewYear, monthIndex));
                    setIsOpen(false);
                  }}
                  className={[
                    "rounded-lg border px-2 py-2 text-sm font-medium transition",
                    isSelected
                      ? "border-primary-200 bg-primary-100 text-primary-700"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
                  ].join(" ")}
                >
                  {monthName.slice(0, 3)}
                </button>
              );
            })}
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
            <button
              type="button"
              onClick={() => {
                onChange(getCurrentMonthValue());
                setIsOpen(false);
              }}
              className="text-sm font-medium text-primary-700 hover:text-primary-800"
            >
              Current month
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
