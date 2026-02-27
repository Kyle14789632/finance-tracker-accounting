import { ChevronDown, ChevronLeft, ChevronRight, type LucideIcon } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

type DateTimePickerFieldProps = {
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

const hours = Array.from({ length: 24 }, (_, hour) => hour);
const minutes = Array.from({ length: 60 }, (_, minute) => minute);

const padNumber = (value: number): string => String(value).padStart(2, "0");

const toDateValue = (date: Date): string =>
  `${date.getFullYear()}-${padNumber(date.getMonth() + 1)}-${padNumber(date.getDate())}`;

const toDateTimeValue = (dateValue: string, hour: number, minute: number): string =>
  `${dateValue}T${padNumber(hour)}:${padNumber(minute)}`;

const parseDateTimeValue = (
  value: string,
): { dateValue: string; hour: number; minute: number; date: Date } => {
  const parsed = /^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2})$/.exec(value);

  if (!parsed) {
    const currentDate = new Date();
    const dateValue = toDateValue(currentDate);

    return {
      dateValue,
      hour: currentDate.getHours(),
      minute: currentDate.getMinutes(),
      date: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()),
    };
  }

  const dateValue = parsed[1];
  const hour = Number(parsed[2]);
  const minute = Number(parsed[3]);
  const [yearPart, monthPart, dayPart] = dateValue.split("-").map(Number);
  const candidate = new Date(yearPart, monthPart - 1, dayPart);

  if (
    Number.isNaN(candidate.getTime()) ||
    !Number.isInteger(hour) ||
    !Number.isInteger(minute) ||
    hour < 0 ||
    hour > 23 ||
    minute < 0 ||
    minute > 59
  ) {
    const currentDate = new Date();
    const fallbackDateValue = toDateValue(currentDate);

    return {
      dateValue: fallbackDateValue,
      hour: currentDate.getHours(),
      minute: currentDate.getMinutes(),
      date: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()),
    };
  }

  return { dateValue, hour, minute, date: candidate };
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

export const DateTimePickerField = ({
  value,
  onChange,
  icon: Icon,
  ariaLabel,
  className,
}: DateTimePickerFieldProps) => {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const parsedValue = parseDateTimeValue(value);
  const [viewDate, setViewDate] = useState(
    new Date(parsedValue.date.getFullYear(), parsedValue.date.getMonth(), 1),
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

    setViewDate(new Date(parsedValue.date.getFullYear(), parsedValue.date.getMonth(), 1));
  }, [isOpen, parsedValue.date]);

  const calendarCells = useMemo(
    () => buildCalendarCells(viewDate.getFullYear(), viewDate.getMonth()),
    [viewDate],
  );

  const displayLabel = useMemo(() => {
    const labelDate = new Date(
      parsedValue.date.getFullYear(),
      parsedValue.date.getMonth(),
      parsedValue.date.getDate(),
      parsedValue.hour,
      parsedValue.minute,
    );

    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(labelDate);
  }, [parsedValue.date, parsedValue.hour, parsedValue.minute]);

  const todayDateValue = toDateValue(new Date());
  const selectedDateValue = parsedValue.dateValue;

  return (
    <div ref={rootRef} className={`relative ${className ?? ""}`}>
      <button
        type="button"
        aria-label={ariaLabel}
        onClick={(event) => {
          event.stopPropagation();
          setIsOpen((open) => !open);
        }}
        className="grid h-[42px] w-full grid-cols-[auto,1fr,auto] overflow-hidden rounded-xl border border-slate-300 bg-white text-left transition hover:border-slate-400 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
      >
        <span className="inline-flex items-center border-r border-slate-200 bg-slate-50 px-3 text-primary-600">
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
        <span className="truncate px-3 py-2.5 text-base text-slate-700">{displayLabel}</span>
        <span className="inline-flex items-center px-3 text-slate-500">
          <ChevronDown
            className={`h-4 w-4 transition ${isOpen ? "rotate-180" : "rotate-0"}`}
            aria-hidden="true"
          />
        </span>
      </button>

      {isOpen ? (
        <section
          className="relative z-50 mt-2 w-full max-h-[75vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:absolute sm:left-auto sm:right-0 sm:w-[36rem] sm:max-w-[calc(100vw-2rem)] sm:max-h-none sm:overflow-visible"
          onClick={(event) => {
            event.stopPropagation();
          }}
        >
          <div className="grid gap-4 md:grid-cols-[1.45fr,1fr]">
            <div>
              <div className="mb-3 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() =>
                    setViewDate(
                      (currentDate) =>
                        new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1),
                    )
                  }
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
                  aria-label="Previous month"
                >
                  <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                </button>
                <p className="text-sm font-semibold text-slate-800">
                  {new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(
                    viewDate,
                  )}
                </p>
                <button
                  type="button"
                  onClick={() =>
                    setViewDate(
                      (currentDate) =>
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
                  <span
                    key={weekdayLabel}
                    className="text-center text-xs font-medium text-slate-500"
                  >
                    {weekdayLabel}
                  </span>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {calendarCells.map((calendarCell) => {
                  const cellValue = toDateValue(calendarCell.date);
                  const isSelected = cellValue === selectedDateValue;
                  const isToday = cellValue === todayDateValue;

                  return (
                    <button
                      key={cellValue}
                      type="button"
                      onClick={() => {
                        onChange(toDateTimeValue(cellValue, parsedValue.hour, parsedValue.minute));
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
            </div>

            <div className="md:border-l md:border-slate-100 md:pl-4">
              <p className="mb-3 text-sm font-semibold text-slate-800">Time</p>
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <div>
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                    Hour
                  </p>
                  <div className="max-h-32 space-y-1 overflow-y-auto rounded-lg border border-slate-200 p-1 sm:max-h-48">
                    {hours.map((hour) => {
                      const isSelected = hour === parsedValue.hour;

                      return (
                        <button
                          key={hour}
                          type="button"
                          onClick={() => {
                            onChange(
                              toDateTimeValue(parsedValue.dateValue, hour, parsedValue.minute),
                            );
                          }}
                          className={[
                            "w-full rounded-md px-2 py-1.5 text-sm font-medium transition",
                            isSelected
                              ? "bg-primary-100 text-primary-700"
                              : "text-slate-700 hover:bg-slate-100",
                          ].join(" ")}
                        >
                          {padNumber(hour)}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                    Minute
                  </p>
                  <div className="max-h-32 space-y-1 overflow-y-auto rounded-lg border border-slate-200 p-1 sm:max-h-48">
                    {minutes.map((minute) => {
                      const isSelected = minute === parsedValue.minute;

                      return (
                        <button
                          key={minute}
                          type="button"
                          onClick={() => {
                            onChange(
                              toDateTimeValue(parsedValue.dateValue, parsedValue.hour, minute),
                            );
                          }}
                          className={[
                            "w-full rounded-md px-2 py-1.5 text-sm font-medium transition",
                            isSelected
                              ? "bg-primary-100 text-primary-700"
                              : "text-slate-700 hover:bg-slate-100",
                          ].join(" ")}
                        >
                          {padNumber(minute)}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
            <button
              type="button"
              onClick={() => {
                const now = new Date();
                onChange(toDateTimeValue(toDateValue(now), now.getHours(), now.getMinutes()));
                setIsOpen(false);
              }}
              className="text-sm font-medium text-primary-700 hover:text-primary-800"
            >
              Now
            </button>
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
              }}
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
