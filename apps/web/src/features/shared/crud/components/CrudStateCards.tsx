type CrudLoadingListCardProps = {
  rowCount?: number;
  titleWidthClassName?: string;
  subtitleWidthClassName?: string;
};

export const CrudLoadingListCard = ({
  rowCount = 4,
  titleWidthClassName = "w-32",
  subtitleWidthClassName = "w-20",
}: CrudLoadingListCardProps) => (
  <section className="rounded-2xl border border-slate-200 bg-white p-5">
    <div className="space-y-3">
      {Array.from({ length: rowCount }).map((_, index) => (
        <div key={index} className="animate-pulse rounded-xl border border-slate-100 px-4 py-3">
          <div className={`h-4 rounded bg-slate-200 ${titleWidthClassName}`} />
          <div className={`mt-2 h-3 rounded bg-slate-100 ${subtitleWidthClassName}`} />
        </div>
      ))}
    </div>
  </section>
);

type CrudErrorCardProps = {
  title: string;
  message: string;
  onRetry: () => void;
  retryLabel?: string;
};

export const CrudErrorCard = ({
  title,
  message,
  onRetry,
  retryLabel = "Retry",
}: CrudErrorCardProps) => (
  <section className="rounded-2xl border border-rose-200 bg-rose-50 p-5">
    <h3 className="text-base font-semibold text-rose-700">{title}</h3>
    <p className="mt-1 text-base text-rose-600">{message}</p>
    <button
      type="button"
      onClick={onRetry}
      className="mt-4 rounded-lg border border-rose-200 bg-white px-3 py-2 text-base font-medium text-rose-700 hover:bg-rose-100"
    >
      {retryLabel}
    </button>
  </section>
);

type CrudEmptyStateCardProps = {
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
  actionDisabled?: boolean;
};

export const CrudEmptyStateCard = ({
  title,
  description,
  actionLabel,
  onAction,
  actionDisabled = false,
}: CrudEmptyStateCardProps) => (
  <section className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
    <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
    <p className="mt-2 text-base text-slate-600">{description}</p>
    <button
      type="button"
      onClick={onAction}
      disabled={actionDisabled}
      className="mt-5 rounded-xl bg-primary-600 px-4 py-2.5 text-base font-medium text-white hover:bg-primary-700 disabled:cursor-not-allowed disabled:bg-primary-300"
    >
      {actionLabel}
    </button>
  </section>
);
