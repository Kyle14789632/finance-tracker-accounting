import type { Category, JournalEntry, Transaction } from "@sft/shared";
import { Archive, Loader2, Pencil } from "lucide-react";
import { formatMoneyCents, formatMoneyString, moneyStringToCents } from "../../../utils/money";
import {
  journalAccountTypeLabel,
  journalSideLabel,
  transactionTypeBadgeClass,
  transactionTypeLabel,
} from "../constants";

type TransactionsListProps = {
  transactions: Transaction[];
  categoryById: Map<string, Category>;
  accountNameById: Map<string, string>;
  currencyFormatter: Intl.NumberFormat;
  dateFormatter: Intl.DateTimeFormat;
  learningModeEnabled: boolean;
  expandedTransactionId: string | null;
  journalEntries: JournalEntry[];
  isJournalLoading: boolean;
  journalErrorMessage: string | null;
  onRetryJournal: () => void;
  deletingTransactionId: string | null;
  onToggleJournalExpansion: (transactionId: string) => void;
  onEdit: (transaction: Transaction) => void;
  onDelete: (transaction: Transaction) => void;
};

export const TransactionsList = ({
  transactions,
  categoryById,
  accountNameById,
  currencyFormatter,
  dateFormatter,
  learningModeEnabled,
  expandedTransactionId,
  journalEntries,
  isJournalLoading,
  journalErrorMessage,
  onRetryJournal,
  deletingTransactionId,
  onToggleJournalExpansion,
  onEdit,
  onDelete,
}: TransactionsListProps) => (
  <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
    <ul className="divide-y divide-slate-100">
      {transactions.map((transaction) => {
        const amountColor = transaction.type === "INCOME" ? "text-emerald-700" : "text-primary-700";
        const transactionAmountCents = moneyStringToCents(transaction.amount);
        const signedAmount = `${transaction.type === "INCOME" ? "+" : "-"}${formatMoneyCents(
          currencyFormatter,
          transactionAmountCents,
        )}`;
        const category = categoryById.get(transaction.categoryId);
        const accountName = accountNameById.get(transaction.accountId) ?? "Unknown account";
        const isDeleting = deletingTransactionId === transaction.id;
        const isExpanded = expandedTransactionId === transaction.id;
        const rowJournalEntries = isExpanded ? journalEntries : [];
        const rowJournalLoading = isExpanded && isJournalLoading;
        const rowJournalErrorMessage = isExpanded ? journalErrorMessage : null;
        const debitTotalCents = rowJournalEntries.reduce(
          (total, entry) =>
            entry.side === "DEBIT" ? total + moneyStringToCents(entry.amount) : total,
          0n,
        );
        const creditTotalCents = rowJournalEntries.reduce(
          (total, entry) =>
            entry.side === "CREDIT" ? total + moneyStringToCents(entry.amount) : total,
          0n,
        );
        const isJournalBalanced = debitTotalCents === creditTotalCents;
        const journalExplanation =
          transaction.type === "INCOME"
            ? "Cash increases (asset) and income increases (revenue)."
            : "Expense increases and cash decreases (asset).";
        const journalBalanceText = formatMoneyCents(currencyFormatter, debitTotalCents);

        return (
          <li key={transaction.id} className="px-4 py-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0">
                <p className="truncate text-base font-semibold text-slate-900">
                  {category?.name ?? "Unknown category"}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {dateFormatter.format(new Date(transaction.occurredAt))} - {accountName}
                </p>
                {transaction.note ? (
                  <p className="mt-2 text-base text-slate-600">{transaction.note}</p>
                ) : null}
                <div className="mt-2 flex flex-wrap gap-2">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-sm font-medium ${transactionTypeBadgeClass[transaction.type]}`}
                  >
                    {transactionTypeLabel[transaction.type]}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <p className={`text-base font-semibold ${amountColor}`}>{signedAmount}</p>
                {learningModeEnabled ? (
                  <button
                    type="button"
                    onClick={() => onToggleJournalExpansion(transaction.id)}
                    className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
                  >
                    {isExpanded ? "Hide journal" : "Show journal"}
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => onEdit(transaction)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50"
                  aria-label={`Edit ${category?.name ?? "transaction"}`}
                  title="Edit transaction"
                >
                  <Pencil className="h-4 w-4" aria-hidden="true" />
                  <span className="sr-only">Edit</span>
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(transaction)}
                  disabled={isDeleting}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-rose-200 text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                  aria-label={`Delete ${category?.name ?? "transaction"}`}
                  title="Delete transaction"
                >
                  {isDeleting ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <Archive className="h-4 w-4" aria-hidden="true" />
                  )}
                  <span className="sr-only">{isDeleting ? "Deleting..." : "Delete"}</span>
                </button>
              </div>
            </div>

            {learningModeEnabled && isExpanded ? (
              <section className="mt-4 rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h4 className="text-base font-semibold text-slate-900">Journal entries</h4>
                  {rowJournalEntries.length > 0 ? (
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-sm font-medium ${
                        isJournalBalanced
                          ? "border border-sage-200 bg-sage-100/70 text-emerald-800"
                          : "border border-rose-200 bg-rose-100 text-rose-700"
                      }`}
                    >
                      {isJournalBalanced ? `Balanced (${journalBalanceText})` : "Unbalanced"}
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 text-sm text-slate-600">{journalExplanation}</p>

                {rowJournalLoading ? (
                  <div className="mt-3 animate-pulse space-y-2">
                    <div className="h-8 rounded-lg bg-slate-200" />
                    <div className="h-8 rounded-lg bg-slate-200" />
                  </div>
                ) : null}

                {rowJournalErrorMessage ? (
                  <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span>{rowJournalErrorMessage}</span>
                      <button
                        type="button"
                        onClick={onRetryJournal}
                        className="rounded-md border border-rose-200 bg-white px-2.5 py-1 text-sm font-medium text-rose-700 hover:bg-rose-100"
                      >
                        Retry
                      </button>
                    </div>
                  </div>
                ) : null}

                {!rowJournalLoading && !rowJournalErrorMessage && rowJournalEntries.length === 0 ? (
                  <p className="mt-3 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
                    No journal entries found for this transaction.
                  </p>
                ) : null}

                {!rowJournalLoading && !rowJournalErrorMessage && rowJournalEntries.length > 0 ? (
                  <div className="mt-3 overflow-hidden rounded-lg border border-slate-200 bg-white">
                    <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                      <thead className="bg-slate-50 text-slate-600">
                        <tr>
                          <th className="px-3 py-2 font-medium">Side</th>
                          <th className="px-3 py-2 font-medium">Account Type</th>
                          <th className="px-3 py-2 font-medium">Label</th>
                          <th className="px-3 py-2 text-right font-medium">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {rowJournalEntries.map((entry) => (
                          <tr key={entry.id}>
                            <td className="px-3 py-2">{journalSideLabel[entry.side]}</td>
                            <td className="px-3 py-2">
                              {journalAccountTypeLabel[entry.accountType]}
                            </td>
                            <td className="px-3 py-2">{entry.label}</td>
                            <td
                              className={`px-3 py-2 text-right font-medium ${
                                entry.side === "DEBIT" ? "text-emerald-700" : "text-primary-700"
                              }`}
                            >
                              {formatMoneyString(currencyFormatter, entry.amount)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : null}
              </section>
            ) : null}
          </li>
        );
      })}
    </ul>
  </section>
);
