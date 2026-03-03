type SessionUnavailableCardProps = {
  onReload: () => void;
};

export const SessionUnavailableCard = ({ onReload }: SessionUnavailableCardProps) => (
  <section className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
    <h2 className="text-lg font-semibold text-slate-900">No settings available</h2>
    <p className="mt-2 text-base text-slate-600">Your profile is not loaded yet.</p>
    <button
      type="button"
      onClick={onReload}
      className="mt-5 rounded-xl bg-primary-600 px-4 py-2.5 text-base font-medium text-white hover:bg-primary-700"
    >
      Reload session
    </button>
  </section>
);
