type BrandLogoProps = {
  variant?: "full" | "mark";
  size?: "sm" | "md" | "lg";
  className?: string;
};

const joinClassNames = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");

const iconSizeClass: Record<NonNullable<BrandLogoProps["size"]>, string> = {
  sm: "h-10 w-10",
  md: "h-12 w-12",
  lg: "h-14 w-14",
};

const textSizeClass: Record<NonNullable<BrandLogoProps["size"]>, string> = {
  sm: "text-[13px]",
  md: "text-sm",
  lg: "text-base",
};

const titleSizeClass: Record<NonNullable<BrandLogoProps["size"]>, string> = {
  sm: "text-base",
  md: "text-lg",
  lg: "text-xl",
};

const markStrokeClass: Record<NonNullable<BrandLogoProps["size"]>, string> = {
  sm: "stroke-[2.4]",
  md: "stroke-[2.3]",
  lg: "stroke-[2.2]",
};

const BrandMark = ({ size = "md" }: { size?: NonNullable<BrandLogoProps["size"]> }) => (
  <span className={joinClassNames("relative inline-flex shrink-0", iconSizeClass[size])}>
    <svg
      viewBox="0 0 48 48"
      className="h-full w-full"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <rect
        x="2"
        y="2"
        width="44"
        height="44"
        rx="14"
        className="fill-primary-50 stroke-primary-200"
        strokeWidth="1.5"
      />
      <path d="M12 34H36" className="stroke-slate-300" strokeWidth="1.5" strokeLinecap="round" />
      <path
        d="M12 22.5L19 16L24.5 20.5L35.5 11.5"
        className={joinClassNames("stroke-primary-600", markStrokeClass[size])}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="22.5" r="2.2" className="fill-primary-500" />
      <circle cx="19" cy="16" r="2.2" className="fill-primary-500" />
      <circle cx="24.5" cy="20.5" r="2.2" className="fill-sage-500" />
      <circle cx="35.5" cy="11.5" r="2.4" className="fill-sage-500" />
      <rect x="10" y="27.5" width="7" height="5" rx="1.5" className="fill-primary-200" />
      <rect x="20.5" y="24" width="7" height="8.5" rx="1.5" className="fill-primary-300" />
      <rect x="31" y="20" width="7" height="12.5" rx="1.5" className="fill-sage-300" />
    </svg>
  </span>
);

export const BrandLogo = ({ variant = "full", size = "md", className }: BrandLogoProps) => {
  if (variant === "mark") {
    return (
      <span className={joinClassNames("inline-flex items-center justify-center", className)}>
        <BrandMark size={size} />
        <span className="sr-only">Student Finance Tracker</span>
      </span>
    );
  }

  return (
    <span className={joinClassNames("inline-flex items-center gap-3", className)}>
      <BrandMark size={size} />
      <span className="min-w-0 leading-tight">
        <span
          className={joinClassNames(
            "block font-semibold uppercase tracking-[0.14em] text-primary-700",
            textSizeClass[size],
          )}
        >
          Student Finance
        </span>
        <span className={joinClassNames("block font-semibold text-slate-800", titleSizeClass[size])}>
          Tracker
        </span>
      </span>
    </span>
  );
};
