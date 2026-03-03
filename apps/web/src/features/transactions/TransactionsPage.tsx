import type { CreateTransactionRequest, Transaction, TransactionType } from "@sft/shared";
import { ArrowUpDown, CalendarDays, Landmark, Tags } from "lucide-react";
import { useMemo, useState } from "react";
import type { UseFormSetError } from "react-hook-form";
import { MonthPickerField } from "../../components/ui/MonthPickerField";
import { SelectMenuField } from "../../components/ui/SelectMenuField";
import { applyApiFormErrors, getApiErrorMessage } from "../../utils/api-errors";
import { useAuthSession } from "../auth/auth-session-context";
import {
  CrudEmptyStateCard,
  CrudErrorCard,
  CrudLoadingListCard,
} from "../shared/crud/components/CrudStateCards";
import { FilterField } from "../shared/crud/components/FilterField";
import { useEntityDialogs } from "../shared/crud/hooks/useEntityDialogs";
import { transactionFilterTypeOptions } from "./constants";
import { DeleteTransactionModal } from "./components/DeleteTransactionModal";
import {
  TransactionFormModal,
  type TransactionFormValues,
} from "./components/TransactionFormModal";
import { TransactionsList } from "./components/TransactionsList";
import { toIsoDateTime } from "./form";
import { useTransactionFilters } from "./hooks/useTransactionFilters";
import { useTransactionFormatters } from "./hooks/useTransactionFormatters";
import { useTransactionJournalState } from "./hooks/useTransactionJournalState";
import { useTransactionLookups } from "./hooks/useTransactionLookups";
import { useTransactionMutations } from "./hooks/useTransactionMutations";
import {
  useTransactionAccountsQuery,
  useTransactionCategoriesQuery,
  useTransactionJournalQuery,
  useTransactionsQuery,
} from "./hooks/useTransactionQueries";

export const TransactionsPage = () => {
  const { accessToken, user } = useAuthSession();
  const [modalError, setModalError] = useState<string | null>(null);
  const [pageError, setPageError] = useState<string | null>(null);
  const [deleteModalError, setDeleteModalError] = useState<string | null>(null);
  const [deletePendingId, setDeletePendingId] = useState<string | null>(null);
  const {
    isEditModalOpen,
    editingEntity: editingTransaction,
    entityToArchive: transactionToDelete,
    openCreate,
    openEdit,
    closeEdit,
    openArchive,
    closeArchive,
  } = useEntityDialogs<Transaction>();

  const accountsQuery = useTransactionAccountsQuery(accessToken);
  const categoriesQuery = useTransactionCategoriesQuery(accessToken);

  const accounts = useMemo(
    () => accountsQuery.data?.accounts ?? [],
    [accountsQuery.data?.accounts],
  );
  const categories = useMemo(
    () => categoriesQuery.data?.categories ?? [],
    [categoriesQuery.data?.categories],
  );

  const {
    selectedMonth,
    selectedTypeFilter,
    selectedAccountFilter,
    selectedCategoryFilter,
    setSelectedMonth,
    setSelectedTypeFilter,
    setSelectedAccountFilter,
    setSelectedCategoryFilter,
    accountFilterOptions,
    categoryFilterOptions,
    queryFilters,
  } = useTransactionFilters(accounts, categories);

  const transactionsQuery = useTransactionsQuery({
    accessToken,
    selectedMonth,
    selectedTypeFilter,
    selectedAccountFilter,
    selectedCategoryFilter,
    queryFilters,
  });

  const transactions = useMemo(
    () => transactionsQuery.data?.transactions ?? [],
    [transactionsQuery.data?.transactions],
  );

  const learningModeEnabled = Boolean(user?.learningModeEnabled);
  const { expandedTransactionId, toggleJournalExpansion, clearExpandedTransaction } =
    useTransactionJournalState(transactions, learningModeEnabled);

  const journalQuery = useTransactionJournalQuery({
    accessToken,
    learningModeEnabled,
    expandedTransactionId,
  });

  const { createTransactionMutation, updateTransactionMutation, deleteTransactionMutation } =
    useTransactionMutations(accessToken);

  const isModalSubmitting =
    createTransactionMutation.isPending || updateTransactionMutation.isPending;
  const isFilterLoading = accountsQuery.isLoading || categoriesQuery.isLoading;
  const isDeleteSubmitting =
    deleteTransactionMutation.isPending && deletePendingId === transactionToDelete?.id;
  const deletingTransactionId = deleteTransactionMutation.isPending ? deletePendingId : null;

  const { accountNameById, categoryById } = useTransactionLookups(accounts, categories);
  const {
    currencyFormatter,
    dateFormatter,
    deleteTransactionCategoryLabel,
    deleteTransactionAmountLabel,
    deleteTransactionOccurredAtLabel,
  } = useTransactionFormatters(user?.currency, transactionToDelete, categoryById);

  const journalEntries = expandedTransactionId ? (journalQuery.data?.journalEntries ?? []) : [];
  const journalErrorMessage =
    expandedTransactionId && journalQuery.isError
      ? getApiErrorMessage(journalQuery.error, "Could not load journal entries.")
      : null;

  const openAddModal = () => {
    setModalError(null);
    openCreate();
  };

  const openEditModal = (transaction: Transaction) => {
    setModalError(null);
    openEdit(transaction);
  };

  const closeModal = () => {
    if (isModalSubmitting) {
      return;
    }

    setModalError(null);
    closeEdit();
  };

  const openDeleteModal = (transaction: Transaction) => {
    setDeleteModalError(null);
    openArchive(transaction);
  };

  const closeDeleteModal = () => {
    if (isDeleteSubmitting) {
      return;
    }

    setDeleteModalError(null);
    closeArchive();
  };

  const handleModalSubmit = async (
    values: TransactionFormValues,
    setError: UseFormSetError<TransactionFormValues>,
  ) => {
    if (!accessToken) {
      setModalError("Your session expired. Please sign in again.");
      return;
    }

    const selectedCategory = categoryById.get(values.categoryId);

    if (!selectedCategory || selectedCategory.type !== values.type) {
      setError("categoryId", {
        type: "manual",
        message: "Category must match transaction type.",
      });
      setModalError("Choose a category that matches the selected type.");
      return;
    }

    const occurredAtIso = toIsoDateTime(values.occurredAtLocal);

    if (!occurredAtIso) {
      setError("occurredAtLocal", {
        type: "manual",
        message: "Occurred at date/time is invalid.",
      });
      return;
    }

    const note = values.note?.trim();
    const payload: CreateTransactionRequest = {
      accountId: values.accountId,
      categoryId: values.categoryId,
      type: values.type,
      amount: values.amount,
      occurredAt: occurredAtIso,
      note: note ? note : undefined,
    };

    setModalError(null);
    setPageError(null);

    try {
      if (editingTransaction) {
        await updateTransactionMutation.mutateAsync({
          transactionId: editingTransaction.id,
          payload,
        });
      } else {
        await createTransactionMutation.mutateAsync(payload);
      }

      closeModal();
    } catch (error) {
      setModalError(applyApiFormErrors(error, setError));
    }
  };

  const handleDeleteTransaction = async () => {
    if (!transactionToDelete) {
      return;
    }

    if (!accessToken) {
      setDeleteModalError("Your session expired. Please sign in again.");
      return;
    }

    if (expandedTransactionId === transactionToDelete.id) {
      clearExpandedTransaction();
    }

    setPageError(null);
    setDeleteModalError(null);
    setDeletePendingId(transactionToDelete.id);

    try {
      await deleteTransactionMutation.mutateAsync(transactionToDelete.id);
      closeDeleteModal();
    } catch (error) {
      setDeleteModalError(getApiErrorMessage(error, "Failed to delete transaction."));
    } finally {
      setDeletePendingId(null);
    }
  };

  return (
    <>
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Transaction log</h2>
            <p className="mt-1 text-base text-slate-600">
              Track income and expenses with account and category filters.
            </p>
          </div>
          <button
            type="button"
            onClick={openAddModal}
            disabled={isFilterLoading || accounts.length === 0 || categories.length === 0}
            className="rounded-xl bg-primary-600 px-4 py-2.5 text-base font-medium text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:bg-primary-300"
          >
            Add transaction
          </button>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          <MonthPickerField
            value={selectedMonth}
            onChange={setSelectedMonth}
            icon={CalendarDays}
            ariaLabel="Filter by month"
          />

          <FilterField icon={ArrowUpDown} className="min-w-0">
            <SelectMenuField
              ariaLabel="Filter by type"
              value={selectedTypeFilter}
              onChange={(nextValue) => setSelectedTypeFilter(nextValue as "ALL" | TransactionType)}
              options={transactionFilterTypeOptions}
              variant="plain"
              menuClassName="left-0 right-0"
            />
          </FilterField>

          <FilterField icon={Landmark} className="min-w-0">
            <SelectMenuField
              ariaLabel="Filter by account"
              value={selectedAccountFilter}
              onChange={setSelectedAccountFilter}
              options={accountFilterOptions}
              variant="plain"
              menuClassName="left-0 right-0"
            />
          </FilterField>

          <FilterField icon={Tags} className="min-w-0">
            <SelectMenuField
              ariaLabel="Filter by category"
              value={selectedCategoryFilter}
              onChange={setSelectedCategoryFilter}
              options={categoryFilterOptions}
              variant="plain"
              menuClassName="left-0 right-0"
            />
          </FilterField>
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
                void transactionsQuery.refetch();
              }}
              className="rounded-lg border border-rose-200 bg-white px-3 py-1.5 text-sm font-medium text-rose-700 hover:bg-rose-100"
            >
              Retry
            </button>
          </div>
        </section>
      ) : null}

      <section className="mt-4">
        {transactionsQuery.isLoading ? (
          <CrudLoadingListCard
            rowCount={5}
            titleWidthClassName="w-40"
            subtitleWidthClassName="w-24"
          />
        ) : null}

        {!transactionsQuery.isLoading && transactionsQuery.isError ? (
          <CrudErrorCard
            title="Could not load transactions"
            message={getApiErrorMessage(
              transactionsQuery.error,
              "Please try again in a few seconds.",
            )}
            onRetry={() => {
              void transactionsQuery.refetch();
            }}
          />
        ) : null}

        {!transactionsQuery.isLoading && !transactionsQuery.isError && transactions.length === 0 ? (
          <CrudEmptyStateCard
            title="No transactions for this filter"
            description={`Add your first transaction for ${selectedMonth} to start building reports.`}
            actionLabel="Create first transaction"
            onAction={openAddModal}
            actionDisabled={accounts.length === 0 || categories.length === 0}
          />
        ) : null}

        {!transactionsQuery.isLoading && !transactionsQuery.isError && transactions.length > 0 ? (
          <TransactionsList
            transactions={transactions}
            categoryById={categoryById}
            accountNameById={accountNameById}
            currencyFormatter={currencyFormatter}
            dateFormatter={dateFormatter}
            learningModeEnabled={learningModeEnabled}
            expandedTransactionId={expandedTransactionId}
            journalEntries={journalEntries}
            isJournalLoading={Boolean(expandedTransactionId) && journalQuery.isLoading}
            journalErrorMessage={journalErrorMessage}
            onRetryJournal={() => {
              void journalQuery.refetch();
            }}
            deletingTransactionId={deletingTransactionId}
            onToggleJournalExpansion={toggleJournalExpansion}
            onEdit={openEditModal}
            onDelete={openDeleteModal}
          />
        ) : null}
      </section>

      <TransactionFormModal
        transaction={editingTransaction}
        accounts={accounts}
        categories={categories}
        isOpen={isEditModalOpen}
        isSubmitting={isModalSubmitting}
        errorMessage={modalError}
        onClose={closeModal}
        onSubmit={handleModalSubmit}
      />

      <DeleteTransactionModal
        isOpen={Boolean(transactionToDelete)}
        isSubmitting={isDeleteSubmitting}
        categoryLabel={deleteTransactionCategoryLabel}
        amountLabel={deleteTransactionAmountLabel}
        occurredAtLabel={deleteTransactionOccurredAtLabel}
        errorMessage={deleteModalError}
        onCancel={closeDeleteModal}
        onConfirm={() => {
          void handleDeleteTransaction();
        }}
      />
    </>
  );
};
