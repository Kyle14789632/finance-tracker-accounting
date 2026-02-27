import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Account, AccountType, CreateAccountRequest } from "@sft/shared";
import { Archive, Landmark, Loader2, Pencil, X, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { UseFormSetError } from "react-hook-form";
import { Controller, useForm } from "react-hook-form";
import { SelectMenuField, type SelectMenuOption } from "../../components/ui/SelectMenuField";
import { applyApiFormErrors, getApiErrorMessage } from "../../utils/api-errors";
import { useAuthSession } from "../auth/auth-session-context";
import { archiveAccount, createAccount, getAccounts, updateAccount } from "./api";
import { createAccountRequestSchema } from "./schemas";

type AccountModalProps = {
  account: Account | null;
  isOpen: boolean;
  isSubmitting: boolean;
  errorMessage: string | null;
  onClose: () => void;
  onSubmit: (
    values: CreateAccountRequest,
    setError: UseFormSetError<CreateAccountRequest>,
  ) => Promise<void>;
};

const accountTypeLabel: Record<AccountType, string> = {
  CASH: "Cash",
  BANK: "Bank",
  SAVINGS: "Savings",
};

const accountTypeBadgeClass: Record<AccountType, string> = {
  CASH: "border border-primary-100 bg-primary-50 text-primary-700",
  BANK: "border border-slate-200 bg-slate-100 text-slate-700",
  SAVINGS: "border border-sage-100 bg-sage-100/60 text-emerald-800",
};

const accountTypeOptions: SelectMenuOption[] = [
  {
    value: "CASH",
    label: "Cash",
    helperText: "Physical cash",
  },
  {
    value: "BANK",
    label: "Bank",
    helperText: "Checking or digital wallet",
  },
  {
    value: "SAVINGS",
    label: "Savings",
    helperText: "Reserve funds",
  },
];

const accountTypeFilterOptions: SelectMenuOption[] = [
  {
    value: "ALL",
    label: "All types",
  },
  {
    value: "CASH",
    label: "Cash only",
  },
  {
    value: "BANK",
    label: "Bank only",
  },
  {
    value: "SAVINGS",
    label: "Savings only",
  },
];

const AccountModal = ({
  account,
  isOpen,
  isSubmitting,
  errorMessage,
  onClose,
  onSubmit,
}: AccountModalProps) => {
  const requestClose = useCallback(() => {
    if (!isSubmitting) {
      onClose();
    }
  }, [isSubmitting, onClose]);

  const {
    control,
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<CreateAccountRequest>({
    resolver: zodResolver(createAccountRequestSchema),
    defaultValues: {
      name: "",
      type: "CASH",
    },
  });

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    reset({
      name: account?.name ?? "",
      type: account?.type ?? "CASH",
    });
  }, [account, isOpen, reset]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        requestClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, requestClose]);

  if (!isOpen) {
    return null;
  }

  const title = account ? "Edit account" : "Add account";
  const submitLabel = account ? "Save changes" : "Create account";

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/30 px-4 py-8"
      onClick={requestClose}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="account-modal-title"
        className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="account-modal-title" className="text-xl font-semibold text-slate-900">
              {title}
            </h2>
            <p className="mt-1 text-base text-slate-600">
              Track where your money sits: cash, bank, or savings.
            </p>
          </div>
          <button
            type="button"
            onClick={requestClose}
            disabled={isSubmitting}
            aria-label="Close account modal"
            title="Close"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <X className="h-4 w-4" aria-hidden="true" />
            <span className="sr-only">Close account modal</span>
          </button>
        </div>

        {errorMessage ? (
          <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-base text-rose-700">
            {errorMessage}
          </div>
        ) : null}

        <form
          className="mt-5 space-y-4"
          onSubmit={handleSubmit(async (values) => {
            await onSubmit(values, setError);
          })}
        >
          <label className="block">
            <span className="text-base font-medium text-slate-700">Name</span>
            <input
              type="text"
              maxLength={100}
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-base outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
              {...register("name")}
            />
            {errors.name ? (
              <span className="mt-1 block text-sm text-rose-600">{errors.name.message}</span>
            ) : null}
          </label>

          <label className="block">
            <span className="text-base font-medium text-slate-700">Type</span>
            <Controller
              control={control}
              name="type"
              render={({ field }) => (
                <SelectMenuField
                  className="mt-1"
                  ariaLabel="Select account type"
                  value={field.value}
                  onChange={(nextValue) => {
                    field.onChange(nextValue as AccountType);
                  }}
                  options={accountTypeOptions}
                />
              )}
            />
            {errors.type ? (
              <span className="mt-1 block text-sm text-rose-600">{errors.type.message}</span>
            ) : null}
          </label>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-primary-600 px-4 py-2.5 text-base font-medium text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:bg-primary-300"
          >
            {isSubmitting ? "Saving..." : submitLabel}
          </button>
        </form>
      </section>
    </div>
  );
};

type ArchiveAccountModalProps = {
  isOpen: boolean;
  isSubmitting: boolean;
  accountName: string;
  accountType: string;
  errorMessage: string | null;
  onCancel: () => void;
  onConfirm: () => void;
};

const ArchiveAccountModal = ({
  isOpen,
  isSubmitting,
  accountName,
  accountType,
  errorMessage,
  onCancel,
  onConfirm,
}: ArchiveAccountModalProps) => {
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isSubmitting) {
        onCancel();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, isSubmitting, onCancel]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/30 px-4 py-8"
      onClick={() => {
        if (!isSubmitting) {
          onCancel();
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="archive-account-title"
        className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="archive-account-title" className="text-xl font-semibold text-slate-900">
              Archive account
            </h2>
            <p className="mt-1 text-base text-slate-600">
              Archived accounts are hidden from active account lists.
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            aria-label="Close archive account confirmation"
            title="Close"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <X className="h-4 w-4" aria-hidden="true" />
            <span className="sr-only">Close archive account confirmation</span>
          </button>
        </div>

        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
          <p className="text-base font-medium text-slate-900">{accountName}</p>
          <p className="mt-1 text-sm text-slate-600">{accountType}</p>
        </div>

        {errorMessage ? (
          <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-base text-rose-700">
            {errorMessage}
          </div>
        ) : null}

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            className="inline-flex items-center justify-center rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-700 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                Archiving...
              </>
            ) : (
              "Archive"
            )}
          </button>
        </div>
      </section>
    </div>
  );
};

const AccountsLoadingState = () => (
  <section className="rounded-2xl border border-slate-200 bg-white p-5">
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="animate-pulse rounded-xl border border-slate-100 px-4 py-3">
          <div className="h-4 w-36 rounded bg-slate-200" />
          <div className="mt-2 h-3 w-20 rounded bg-slate-100" />
        </div>
      ))}
    </div>
  </section>
);

type FilterFieldProps = {
  icon: LucideIcon;
  children: ReactNode;
};

const FilterField = ({ icon: Icon, children }: FilterFieldProps) => (
  <div className="grid grid-cols-[auto,1fr] min-w-60 rounded-xl border border-slate-300 bg-white transition focus-within:border-primary-400 focus-within:ring-2 focus-within:ring-primary-100">
    <div className="inline-flex h-[42px] items-center rounded-l-xl border-r border-slate-200 bg-slate-50 px-3 text-primary-600">
      <Icon className="h-4 w-4" aria-hidden="true" />
    </div>
    <div className="min-w-0 flex-1">{children}</div>
  </div>
);

export const AccountsPage = () => {
  const queryClient = useQueryClient();
  const { accessToken } = useAuthSession();
  const [activeTypeFilter, setActiveTypeFilter] = useState<"ALL" | AccountType>("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);
  const [pageError, setPageError] = useState<string | null>(null);
  const [accountToArchive, setAccountToArchive] = useState<Account | null>(null);
  const [archiveModalError, setArchiveModalError] = useState<string | null>(null);
  const [archivePendingId, setArchivePendingId] = useState<string | null>(null);

  const accountsQuery = useQuery({
    queryKey: ["accounts", activeTypeFilter],
    enabled: Boolean(accessToken),
    queryFn: () =>
      getAccounts(
        accessToken as string,
        activeTypeFilter === "ALL" ? {} : { type: activeTypeFilter },
      ),
  });

  const createAccountMutation = useMutation({
    mutationFn: (payload: CreateAccountRequest) => createAccount(accessToken as string, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["accounts"] });
    },
  });

  const updateAccountMutation = useMutation({
    mutationFn: (params: { accountId: string; payload: CreateAccountRequest }) =>
      updateAccount(accessToken as string, params.accountId, params.payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["accounts"] });
    },
  });

  const archiveAccountMutation = useMutation({
    mutationFn: (accountId: string) => archiveAccount(accessToken as string, accountId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["accounts"] });
    },
  });

  const accounts = useMemo(
    () => accountsQuery.data?.accounts ?? [],
    [accountsQuery.data?.accounts],
  );
  const isModalSubmitting = createAccountMutation.isPending || updateAccountMutation.isPending;
  const isArchiveSubmitting =
    archiveAccountMutation.isPending && archivePendingId === accountToArchive?.id;
  const archiveAccountType = accountToArchive ? accountTypeLabel[accountToArchive.type] : "";

  const openAddModal = () => {
    setEditingAccount(null);
    setModalError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (account: Account) => {
    setEditingAccount(account);
    setModalError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (isModalSubmitting) {
      return;
    }

    setIsModalOpen(false);
    setEditingAccount(null);
    setModalError(null);
  };

  const openArchiveModal = (account: Account) => {
    setAccountToArchive(account);
    setArchiveModalError(null);
  };

  const closeArchiveModal = () => {
    if (isArchiveSubmitting) {
      return;
    }

    setAccountToArchive(null);
    setArchiveModalError(null);
  };

  const handleModalSubmit = async (
    values: CreateAccountRequest,
    setError: UseFormSetError<CreateAccountRequest>,
  ) => {
    if (!accessToken) {
      setModalError("Your session expired. Please sign in again.");
      return;
    }

    setModalError(null);
    setPageError(null);

    try {
      if (editingAccount) {
        await updateAccountMutation.mutateAsync({
          accountId: editingAccount.id,
          payload: values,
        });
      } else {
        await createAccountMutation.mutateAsync(values);
      }

      closeModal();
    } catch (error) {
      setModalError(applyApiFormErrors(error, setError));
    }
  };

  const handleArchive = async () => {
    if (!accountToArchive) {
      return;
    }

    if (!accessToken) {
      setArchiveModalError("Your session expired. Please sign in again.");
      return;
    }

    setPageError(null);
    setArchiveModalError(null);
    setArchivePendingId(accountToArchive.id);

    try {
      await archiveAccountMutation.mutateAsync(accountToArchive.id);
      closeArchiveModal();
    } catch (error) {
      setArchiveModalError(getApiErrorMessage(error, "Failed to archive account."));
    } finally {
      setArchivePendingId(null);
    }
  };

  return (
    <>
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Asset accounts</h2>
            <p className="mt-1 text-base text-slate-600">
              Manage your cash, bank, and savings accounts.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <FilterField icon={Landmark}>
              <SelectMenuField
                ariaLabel="Filter by account type"
                value={activeTypeFilter}
                onChange={(nextValue) => setActiveTypeFilter(nextValue as "ALL" | AccountType)}
                options={accountTypeFilterOptions}
                variant="plain"
                menuClassName="left-0 right-0"
              />
            </FilterField>
            <button
              type="button"
              onClick={openAddModal}
              className="rounded-xl bg-primary-600 px-4 py-2.5 text-base font-medium text-white transition hover:bg-primary-700"
            >
              Add account
            </button>
          </div>
        </div>
      </section>

      {pageError ? (
        <section className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-base text-rose-700">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span>{pageError}</span>
            <button
              type="button"
              onClick={() => {
                setPageError(null);
                void accountsQuery.refetch();
              }}
              className="rounded-lg border border-rose-200 bg-white px-3 py-1.5 text-sm font-medium text-rose-700 hover:bg-rose-100"
            >
              Retry
            </button>
          </div>
        </section>
      ) : null}

      <section className="mt-4">
        {accountsQuery.isLoading ? <AccountsLoadingState /> : null}

        {!accountsQuery.isLoading && accountsQuery.isError ? (
          <section className="rounded-2xl border border-rose-200 bg-rose-50 p-5">
            <h3 className="text-base font-semibold text-rose-700">Could not load accounts</h3>
            <p className="mt-1 text-base text-rose-600">
              {getApiErrorMessage(accountsQuery.error, "Please try again in a few seconds.")}
            </p>
            <button
              type="button"
              onClick={() => void accountsQuery.refetch()}
              className="mt-4 rounded-lg border border-rose-200 bg-white px-3 py-2 text-base font-medium text-rose-700 hover:bg-rose-100"
            >
              Retry
            </button>
          </section>
        ) : null}

        {!accountsQuery.isLoading && !accountsQuery.isError && accounts.length === 0 ? (
          <section className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
            <h3 className="text-lg font-semibold text-slate-900">No accounts yet</h3>
            <p className="mt-2 text-base text-slate-600">
              Add your first account to start tracking balances.
            </p>
            <button
              type="button"
              onClick={openAddModal}
              className="mt-5 rounded-xl bg-primary-600 px-4 py-2.5 text-base font-medium text-white hover:bg-primary-700"
            >
              Create first account
            </button>
          </section>
        ) : null}

        {!accountsQuery.isLoading && !accountsQuery.isError && accounts.length > 0 ? (
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <ul className="divide-y divide-slate-100">
              {accounts.map((account) => {
                const isArchivingCurrent =
                  archiveAccountMutation.isPending && archivePendingId === account.id;

                return (
                  <li
                    key={account.id}
                    className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-base font-semibold text-slate-900">
                        {account.name}
                      </p>
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
                        onClick={() => openEditModal(account)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50"
                        aria-label={`Edit ${account.name}`}
                        title="Edit account"
                      >
                        <Pencil className="h-4 w-4" aria-hidden="true" />
                        <span className="sr-only">Edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => openArchiveModal(account)}
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
                        <span className="sr-only">
                          {isArchivingCurrent ? "Archiving..." : "Archive"}
                        </span>
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        ) : null}
      </section>

      <AccountModal
        account={editingAccount}
        isOpen={isModalOpen}
        isSubmitting={isModalSubmitting}
        errorMessage={modalError}
        onClose={closeModal}
        onSubmit={handleModalSubmit}
      />
      <ArchiveAccountModal
        isOpen={Boolean(accountToArchive)}
        isSubmitting={isArchiveSubmitting}
        accountName={accountToArchive?.name ?? ""}
        accountType={archiveAccountType}
        errorMessage={archiveModalError}
        onCancel={closeArchiveModal}
        onConfirm={() => {
          void handleArchive();
        }}
      />
    </>
  );
};
