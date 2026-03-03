import type { Account, AccountType, CreateAccountRequest } from "@sft/shared";
import { Landmark } from "lucide-react";
import { useMemo, useState } from "react";
import type { UseFormSetError } from "react-hook-form";
import { SelectMenuField } from "../../components/ui/SelectMenuField";
import { applyApiFormErrors, getApiErrorMessage } from "../../utils/api-errors";
import { useAuthSession } from "../auth/auth-session-context";
import {
  CrudEmptyStateCard,
  CrudErrorCard,
  CrudLoadingListCard,
} from "../shared/crud/components/CrudStateCards";
import { EntityArchiveConfirmModal } from "../shared/crud/components/EntityArchiveConfirmModal";
import { FilterField } from "../shared/crud/components/FilterField";
import { useEntityDialogs } from "../shared/crud/hooks/useEntityDialogs";
import { AccountFormModal } from "./components/AccountFormModal";
import { AccountsList } from "./components/AccountsList";
import { accountTypeFilterOptions, accountTypeLabel } from "./constants";
import { useAccountMutations } from "./hooks/useAccountMutations";
import { useAccountsQuery } from "./hooks/useAccountsQuery";

export const AccountsPage = () => {
  const { accessToken } = useAuthSession();
  const [activeTypeFilter, setActiveTypeFilter] = useState<"ALL" | AccountType>("ALL");
  const [modalError, setModalError] = useState<string | null>(null);
  const [pageError, setPageError] = useState<string | null>(null);
  const [archiveModalError, setArchiveModalError] = useState<string | null>(null);
  const [archivePendingId, setArchivePendingId] = useState<string | null>(null);
  const {
    isEditModalOpen,
    editingEntity: editingAccount,
    entityToArchive: accountToArchive,
    openCreate,
    openEdit,
    closeEdit,
    openArchive,
    closeArchive,
  } = useEntityDialogs<Account>();

  const accountsQuery = useAccountsQuery(accessToken, activeTypeFilter);
  const { createAccountMutation, updateAccountMutation, archiveAccountMutation } =
    useAccountMutations(accessToken);

  const accounts = useMemo(
    () => accountsQuery.data?.accounts ?? [],
    [accountsQuery.data?.accounts],
  );
  const isModalSubmitting = createAccountMutation.isPending || updateAccountMutation.isPending;
  const isArchiveSubmitting =
    archiveAccountMutation.isPending && archivePendingId === accountToArchive?.id;
  const archiveAccountType = accountToArchive ? accountTypeLabel[accountToArchive.type] : "";
  const archivingAccountId = archiveAccountMutation.isPending ? archivePendingId : null;

  const openAddModal = () => {
    setModalError(null);
    openCreate();
  };

  const openEditModal = (account: Account) => {
    setModalError(null);
    openEdit(account);
  };

  const closeModal = () => {
    if (isModalSubmitting) {
      return;
    }

    setModalError(null);
    closeEdit();
  };

  const openArchiveModal = (account: Account) => {
    setArchiveModalError(null);
    openArchive(account);
  };

  const closeArchiveModal = () => {
    if (isArchiveSubmitting) {
      return;
    }

    setArchiveModalError(null);
    closeArchive();
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
        {accountsQuery.isLoading ? (
          <CrudLoadingListCard
            rowCount={4}
            titleWidthClassName="w-36"
            subtitleWidthClassName="w-20"
          />
        ) : null}

        {!accountsQuery.isLoading && accountsQuery.isError ? (
          <CrudErrorCard
            title="Could not load accounts"
            message={getApiErrorMessage(accountsQuery.error, "Please try again in a few seconds.")}
            onRetry={() => {
              void accountsQuery.refetch();
            }}
          />
        ) : null}

        {!accountsQuery.isLoading && !accountsQuery.isError && accounts.length === 0 ? (
          <CrudEmptyStateCard
            title="No accounts yet"
            description="Add your first account to start tracking balances."
            actionLabel="Create first account"
            onAction={openAddModal}
          />
        ) : null}

        {!accountsQuery.isLoading && !accountsQuery.isError && accounts.length > 0 ? (
          <AccountsList
            accounts={accounts}
            archivingAccountId={archivingAccountId}
            onEdit={openEditModal}
            onArchive={openArchiveModal}
          />
        ) : null}
      </section>

      <AccountFormModal
        account={editingAccount}
        isOpen={isEditModalOpen}
        isSubmitting={isModalSubmitting}
        errorMessage={modalError}
        onClose={closeModal}
        onSubmit={handleModalSubmit}
      />

      <EntityArchiveConfirmModal
        isOpen={Boolean(accountToArchive)}
        isSubmitting={isArchiveSubmitting}
        title="Archive account"
        description="Archived accounts are hidden from active account lists."
        entityName={accountToArchive?.name ?? ""}
        entityMeta={archiveAccountType}
        errorMessage={archiveModalError}
        onCancel={closeArchiveModal}
        onConfirm={() => {
          void handleArchive();
        }}
      />
    </>
  );
};
