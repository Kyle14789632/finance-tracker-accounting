import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Account, AccountType, CreateAccountRequest } from "@sft/shared";
import { useEffect, useMemo, useState } from "react";
import type { UseFormSetError } from "react-hook-form";
import { useForm } from "react-hook-form";
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
  onSubmit: (values: CreateAccountRequest, setError: UseFormSetError<CreateAccountRequest>) => Promise<void>;
};

const accountTypeLabel: Record<AccountType, string> = {
  CASH: "Cash",
  BANK: "Bank",
  SAVINGS: "Savings"
};

const accountTypeBadgeClass: Record<AccountType, string> = {
  CASH: "border border-primary-100 bg-primary-50 text-primary-700",
  BANK: "border border-slate-200 bg-slate-100 text-slate-700",
  SAVINGS: "border border-sage-100 bg-sage-100/60 text-emerald-800"
};

const AccountModal = ({ account, isOpen, isSubmitting, errorMessage, onClose, onSubmit }: AccountModalProps) => {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors }
  } = useForm<CreateAccountRequest>({
    resolver: zodResolver(createAccountRequestSchema),
    defaultValues: {
      name: "",
      type: "CASH"
    }
  });

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    reset({
      name: account?.name ?? "",
      type: account?.type ?? "CASH"
    });
  }, [account, isOpen, reset]);

  if (!isOpen) {
    return null;
  }

  const title = account ? "Edit account" : "Add account";
  const submitLabel = account ? "Save changes" : "Create account";

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/30 px-4 py-8">
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
            <p className="mt-1 text-sm text-slate-600">Track where your money sits: cash, bank, or savings.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Close
          </button>
        </div>

        {errorMessage ? (
          <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{errorMessage}</div>
        ) : null}

        <form
          className="mt-5 space-y-4"
          onSubmit={handleSubmit(async (values) => {
            await onSubmit(values, setError);
          })}
        >
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Name</span>
            <input
              type="text"
              maxLength={100}
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
              {...register("name")}
            />
            {errors.name ? <span className="mt-1 block text-xs text-rose-600">{errors.name.message}</span> : null}
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Type</span>
            <select
              className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
              {...register("type")}
            >
              <option value="CASH">Cash</option>
              <option value="BANK">Bank</option>
              <option value="SAVINGS">Savings</option>
            </select>
            {errors.type ? <span className="mt-1 block text-xs text-rose-600">{errors.type.message}</span> : null}
          </label>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:bg-primary-300"
          >
            {isSubmitting ? "Saving..." : submitLabel}
          </button>
        </form>
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

export const AccountsPage = () => {
  const queryClient = useQueryClient();
  const { accessToken } = useAuthSession();
  const [activeTypeFilter, setActiveTypeFilter] = useState<"ALL" | AccountType>("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);
  const [pageError, setPageError] = useState<string | null>(null);
  const [archivePendingId, setArchivePendingId] = useState<string | null>(null);

  const accountsQuery = useQuery({
    queryKey: ["accounts", activeTypeFilter],
    enabled: Boolean(accessToken),
    queryFn: () =>
      getAccounts(accessToken as string, activeTypeFilter === "ALL" ? {} : { type: activeTypeFilter })
  });

  const createAccountMutation = useMutation({
    mutationFn: (payload: CreateAccountRequest) => createAccount(accessToken as string, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["accounts"] });
    }
  });

  const updateAccountMutation = useMutation({
    mutationFn: (params: { accountId: string; payload: CreateAccountRequest }) =>
      updateAccount(accessToken as string, params.accountId, params.payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["accounts"] });
    }
  });

  const archiveAccountMutation = useMutation({
    mutationFn: (accountId: string) => archiveAccount(accessToken as string, accountId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["accounts"] });
    }
  });

  const accounts = useMemo(() => accountsQuery.data?.accounts ?? [], [accountsQuery.data?.accounts]);
  const isModalSubmitting = createAccountMutation.isPending || updateAccountMutation.isPending;

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

  const handleModalSubmit = async (
    values: CreateAccountRequest,
    setError: UseFormSetError<CreateAccountRequest>
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
          payload: values
        });
      } else {
        await createAccountMutation.mutateAsync(values);
      }

      closeModal();
    } catch (error) {
      setModalError(applyApiFormErrors(error, setError));
    }
  };

  const handleArchive = async (account: Account) => {
    if (!accessToken) {
      setPageError("Your session expired. Please sign in again.");
      return;
    }

    const confirmed = window.confirm(`Archive "${account.name}"? It will be hidden from active account lists.`);

    if (!confirmed) {
      return;
    }

    setPageError(null);
    setArchivePendingId(account.id);

    try {
      await archiveAccountMutation.mutateAsync(account.id);
    } catch (error) {
      setPageError(getApiErrorMessage(error, "Failed to archive account."));
    } finally {
      setArchivePendingId(null);
    }
  };

  return (
    <>
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Asset accounts</h2>
            <p className="mt-1 text-sm text-slate-600">Manage your cash, bank, and savings accounts.</p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <select
              value={activeTypeFilter}
              onChange={(event) => setActiveTypeFilter(event.target.value as "ALL" | AccountType)}
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
            >
              <option value="ALL">All types</option>
              <option value="CASH">Cash only</option>
              <option value="BANK">Bank only</option>
              <option value="SAVINGS">Savings only</option>
            </select>
            <button
              type="button"
              onClick={openAddModal}
              className="rounded-xl bg-primary-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-700"
            >
              Add account
            </button>
          </div>
        </div>
      </section>

      {pageError ? (
        <section className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span>{pageError}</span>
            <button
              type="button"
              onClick={() => {
                setPageError(null);
                void accountsQuery.refetch();
              }}
              className="rounded-lg border border-rose-200 bg-white px-3 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-100"
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
            <h3 className="text-sm font-semibold text-rose-700">Could not load accounts</h3>
            <p className="mt-1 text-sm text-rose-600">
              {getApiErrorMessage(accountsQuery.error, "Please try again in a few seconds.")}
            </p>
            <button
              type="button"
              onClick={() => void accountsQuery.refetch()}
              className="mt-4 rounded-lg border border-rose-200 bg-white px-3 py-2 text-sm font-medium text-rose-700 hover:bg-rose-100"
            >
              Retry
            </button>
          </section>
        ) : null}

        {!accountsQuery.isLoading && !accountsQuery.isError && accounts.length === 0 ? (
          <section className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
            <h3 className="text-base font-semibold text-slate-900">No accounts yet</h3>
            <p className="mt-2 text-sm text-slate-600">Add your first account to start tracking balances.</p>
            <button
              type="button"
              onClick={openAddModal}
              className="mt-5 rounded-xl bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
            >
              Create first account
            </button>
          </section>
        ) : null}

        {!accountsQuery.isLoading && !accountsQuery.isError && accounts.length > 0 ? (
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <ul className="divide-y divide-slate-100">
              {accounts.map((account) => {
                const isArchivingCurrent = archiveAccountMutation.isPending && archivePendingId === account.id;

                return (
                  <li key={account.id} className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">{account.name}</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${accountTypeBadgeClass[account.type]}`}>
                          {accountTypeLabel[account.type]}
                        </span>
                        {account.isArchived ? (
                          <span className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
                            Archived
                          </span>
                        ) : null}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => openEditModal(account)}
                        className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleArchive(account)}
                        disabled={isArchivingCurrent}
                        className="rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isArchivingCurrent ? "Archiving..." : "Archive"}
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
    </>
  );
};
