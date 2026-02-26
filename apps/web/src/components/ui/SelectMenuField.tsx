import { Check, ChevronDown } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

export type SelectMenuOption = {
  value: string;
  label: string;
  helperText?: string;
  disabled?: boolean;
};

type SelectMenuFieldProps = {
  value: string;
  onChange: (value: string) => void;
  options: SelectMenuOption[];
  ariaLabel: string;
  placeholder?: string;
  disabled?: boolean;
  variant?: "default" | "plain";
  className?: string;
  triggerClassName?: string;
  menuClassName?: string;
  emptyMessage?: string;
};

const joinClassNames = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");

export const SelectMenuField = ({
  value,
  onChange,
  options,
  ariaLabel,
  placeholder = "Select option",
  disabled = false,
  variant = "default",
  className,
  triggerClassName,
  menuClassName,
  emptyMessage = "No options available",
}: SelectMenuFieldProps) => {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = useMemo(
    () => options.find((option) => option.value === value),
    [options, value],
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
    if (disabled) {
      setIsOpen(false);
    }
  }, [disabled]);

  const triggerBaseClass =
    variant === "plain"
      ? "flex h-[42px] w-full items-center justify-between gap-2 bg-transparent px-3 text-left text-base text-slate-700 outline-none"
      : "flex h-[42px] w-full items-center justify-between gap-2 rounded-xl border border-slate-300 bg-white px-3 text-left text-base text-slate-700 transition hover:border-slate-400 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400";

  return (
    <div ref={rootRef} className={joinClassNames("relative", className)}>
      <button
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        disabled={disabled}
        onClick={() => setIsOpen((open) => !open)}
        className={joinClassNames(
          triggerBaseClass,
          variant === "plain" && disabled ? "cursor-not-allowed text-slate-400" : "",
          triggerClassName,
        )}
      >
        <span className="min-w-0 truncate">{selectedOption?.label ?? placeholder}</span>
        <ChevronDown
          className={joinClassNames("h-4 w-4 shrink-0 text-slate-500 transition", isOpen && "rotate-180")}
          aria-hidden="true"
        />
      </button>

      {isOpen ? (
        <section
          role="listbox"
          className={joinClassNames(
            "absolute left-0 right-0 z-50 mt-2 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_10px_24px_rgba(15,23,42,0.08)]",
            menuClassName,
          )}
        >
          {options.length > 0 ? (
            <div className="max-h-64 overflow-y-auto p-1">
              {options.map((option) => {
                const isSelected = option.value === value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    disabled={option.disabled}
                    onClick={() => {
                      if (option.disabled) {
                        return;
                      }

                      onChange(option.value);
                      setIsOpen(false);
                    }}
                    className={joinClassNames(
                      "flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-left transition",
                      option.disabled
                        ? "cursor-not-allowed text-slate-300"
                        : isSelected
                          ? "bg-primary-50 text-primary-800"
                          : "text-slate-700 hover:bg-slate-50",
                    )}
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium">{option.label}</span>
                      {option.helperText ? (
                        <span className="mt-0.5 block truncate text-xs text-slate-500">
                          {option.helperText}
                        </span>
                      ) : null}
                    </span>
                    <Check
                      className={joinClassNames(
                        "h-4 w-4 shrink-0 transition",
                        isSelected ? "text-primary-700 opacity-100" : "opacity-0",
                      )}
                      aria-hidden="true"
                    />
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="px-3 py-3 text-sm text-slate-500">{emptyMessage}</p>
          )}
        </section>
      ) : null}
    </div>
  );
};
