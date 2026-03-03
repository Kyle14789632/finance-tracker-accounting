type ShowJournalCardProps = {
  showJournalEnabled: boolean;
  saveStateText: string;
  isSavingToggle: boolean;
  onToggle: () => void;
};

export const ShowJournalCard = ({
  showJournalEnabled,
  saveStateText,
  isSavingToggle,
  onToggle,
}: ShowJournalCardProps) => (
  <section className="rounded-2xl border border-slate-200 bg-white p-5">
    <div>
      <h2 className="text-xl font-semibold text-slate-900">Show journal</h2>
      <p className="mt-1 text-base text-slate-600">
        Turn this on to reveal journal entries and accounting explanations in Transactions.
      </p>
    </div>

    <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-base font-semibold text-slate-900">
            {showJournalEnabled ? "Journal display is enabled" : "Journal display is disabled"}
          </p>
          <p className="mt-1 text-sm text-slate-600">{saveStateText}</p>
        </div>

        <button
          type="button"
          role="switch"
          aria-checked={showJournalEnabled}
          aria-label="Toggle show journal"
          disabled={isSavingToggle}
          onClick={onToggle}
          className={`inline-flex h-7 w-12 items-center rounded-full p-1 transition ${
            showJournalEnabled ? "bg-primary-600" : "bg-slate-300"
          } disabled:cursor-not-allowed disabled:opacity-60`}
        >
          <span
            className={`h-5 w-5 rounded-full bg-white transition ${
              showJournalEnabled ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
      </div>
    </div>
  </section>
);
