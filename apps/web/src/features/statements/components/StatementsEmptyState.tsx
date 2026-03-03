import { Link } from "react-router-dom";

type StatementsEmptyStateProps = {
  title: string;
  description: string;
};

export const StatementsEmptyState = ({ title, description }: StatementsEmptyStateProps) => (
  <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-8 text-center">
    <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
    <p className="mt-2 text-base text-slate-600">{description}</p>
    <Link
      to="/app/transactions"
      className="mt-5 inline-flex rounded-xl bg-primary-600 px-4 py-2.5 text-base font-medium text-white hover:bg-primary-700"
    >
      Add first transaction
    </Link>
  </section>
);
