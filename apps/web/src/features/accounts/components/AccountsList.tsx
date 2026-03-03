import type { Account } from "@sft/shared";
import { Archive, Loader2, Pencil } from "lucide-react";
import { accountTypeBadgeClass, accountTypeLabel } from "../constants";

type AccountsListProps = {
  accounts: Account[];
  archivingAccountId: string | null;
  onEdit: (account: Account) => void;
  onArchive: (account: Account) => void;
};

export const AccountsList = ({
  accounts,
  archivingAccountId,
  onEdit,
  onArchive,
}: AccountsListProps) => (
  <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
    <ul className="divide-y divide-slate-100">
      {accounts.map((account) => {
        const isArchivingCurrent = archivingAccountId === account.id;

        return (
          <li
            key={account.id}
            className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0">
              <p className="truncate text-base font-semibold text-slate-900">{account.name}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <span
                  className={`inline-flex rounded-full px-2.5 py-1 text-sm font-medium ${accountTypeBadgeClass[account.type]}`}
                >
                  {accountTypeLabel[account.type]}
                </span>
                {account.isArchived ? (
                  <span className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-sm font-medium text-amber-700">
                    Archived
                  </span>
                ) : null}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => onEdit(account)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50"
                aria-label={`Edit ${account.name}`}
                title="Edit account"
              >
                <Pencil className="h-4 w-4" aria-hidden="true" />
                <span className="sr-only">Edit</span>
              </button>
              <button
                type="button"
                onClick={() => onArchive(account)}
                disabled={isArchivingCurrent}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-rose-200 text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                aria-label={`Archive ${account.name}`}
                title="Archive account"
              >
                {isArchivingCurrent ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Archive className="h-4 w-4" aria-hidden="true" />
                )}
                <span className="sr-only">{isArchivingCurrent ? "Archiving..." : "Archive"}</span>
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  </section>
);
