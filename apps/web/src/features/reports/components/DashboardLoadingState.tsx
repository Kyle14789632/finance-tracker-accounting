export const DashboardLoadingState = () => (
  <section className="mt-4 space-y-4">
    <div className="grid gap-3 md:grid-cols-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="animate-pulse rounded-2xl border border-slate-200 bg-white p-4">
          <div className="h-3 w-20 rounded bg-slate-200" />
          <div className="mt-3 h-6 w-28 rounded bg-slate-300" />
          <div className="mt-2 h-3 w-32 rounded bg-slate-100" />
        </div>
      ))}
    </div>

    <div className="grid gap-4 xl:grid-cols-2">
      {Array.from({ length: 2 }).map((_, index) => (
        <div key={index} className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5">
          <div className="h-4 w-44 rounded bg-slate-200" />
          <div className="mt-5 h-64 rounded-xl bg-slate-100" />
        </div>
      ))}
    </div>
  </section>
);
