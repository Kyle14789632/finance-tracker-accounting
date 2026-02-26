import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  Account,
  Category,
  CreateTransactionRequest,
  JournalEntry,
  Transaction,
  TransactionType
} from "@sft/shared";
import { useEffect, useMemo, useState } from "react";
import type { UseFormSetError } from "react-hook-form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { applyApiFormErrors, getApiErrorMessage } from "../../utils/api-errors";
import { formatMoneyCents, formatMoneyString, moneyStringToCents } from "../../utils/money";
import { getAccounts } from "../accounts/api";
import { useAuthSession } from "../auth/auth-session-context";
import { getCategories } from "../categories/api";
import {
  createTransaction,
  deleteTransaction,
  getTransactionJournal,
  getTransactions,
  updateTransaction
} from "./api";
import { moneyStringSchema, transactionTypeSchema } from "./schemas";

const transactionTypeLabel: Record<TransactionType, string> = {
  INCOME: "Income",
  EXPENSE: "Expense"
};

const transactionTypeBadgeClass: Record<TransactionType, string> = {
  INCOME: "border border-sage-100 bg-sage-100/60 text-emerald-800",
  EXPENSE: "border border-primary-100 bg-primary-50 text-primary-700"
};

const journalSideLabel: Record<JournalEntry["side"], string> = {
  DEBIT: "Debit",
  CREDIT: "Credit"
};

const journalAccountTypeLabel: Record<JournalEntry["accountType"], string> = {
  ASSET: "Asset",
  REVENUE: "Revenue",
  EXPENSE: "Expense"
};

const transactionFormSchema = z.object({
  accountId: z.string().uuid("Account is required"),
  categoryId: z.string().uuid("Category is required"),
  type: transactionTypeSchema,
  amount: moneyStringSchema,
  occurredAtLocal: z.string().min(1, "Occurred at date/time is required"),
  note: z.string().max(500, "Note must be at most 500 characters").optional()
});

type TransactionFormValues = z.infer<typeof transactionFormSchema>;

type TransactionModalProps = {
  transaction: Transaction | null;
  accounts: Account[];
  categories: Category[];
  isOpen: boolean;
  isSubmitting: boolean;
  errorMessage: string | null;
  onClose: () => void;
  onSubmit: (
    values: TransactionFormValues,
    setError: UseFormSetError<TransactionFormValues>
  ) => Promise<void>;
};

const toDateTimeLocal = (isoString: string): string => {
  const date = new Date(isoString);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const pad = (value: number): string => value.toString().padStart(2, "0");

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}`;
};

const getDefaultOccurredAtLocal = (): string => toDateTimeLocal(new Date().toISOString());

const toIsoDateTime = (value: string): string | null => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString();
};

const TransactionModal = ({
  transaction,
  accounts,
  categories,
  isOpen,
  isSubmitting,
  errorMessage,
  onClose,
  onSubmit
}: TransactionModalProps) => {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    getValues,
    setError,
    formState: { errors }
  } = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: {
      accountId: "",
      categoryId: "",
      type: "EXPENSE",
      amount: "",
      occurredAtLocal: getDefaultOccurredAtLocal(),
      note: ""
    }
  });

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const defaultType: TransactionType = transaction?.type ?? "EXPENSE";
    const firstAccountId = accounts[0]?.id ?? "";
    const defaultCategoryId =
      categories.find((category) => category.type === defaultType)?.id ?? "";

    reset({
      accountId: transaction?.accountId ?? firstAccountId,
      categoryId: transaction?.categoryId ?? defaultCategoryId,
      type: defaultType,
      amount: transaction?.amount ?? "",
      occurredAtLocal: transaction ? toDateTimeLocal(transaction.occurredAt) : getDefaultOccurredAtLocal(),
      note: transaction?.note ?? ""
    });
  }, [accounts, categories, isOpen, reset, transaction]);

  const selectedType = watch("type");

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const currentCategoryId = getValues("categoryId");
    const currentCategory = categories.find((category) => category.id === currentCategoryId);

    if (currentCategory && currentCategory.type === selectedType) {
      return;
    }

    const nextCategoryId = categories.find((category) => category.type === selectedType)?.id ?? "";
    setValue("categoryId", nextCategoryId, {
      shouldValidate: true
    });
  }, [categories, getValues, isOpen, selectedType, setValue]);

  if (!isOpen) {
    return null;
  }

  const title = transaction ? "Edit transaction" : "Add transaction";
  const submitLabel = transaction ? "Save changes" : "Create transaction";
  const categoryOptions = categories.filter((category) => category.type === selectedType);

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/30 px-4 py-8">
      <section className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
            <p className="mt-1 text-sm text-slate-600">
              Capture amount, account, category, and date in one place.
            </p>
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
          <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {errorMessage}
          </div>
        ) : null}

        <form
          className="mt-5 grid gap-4 sm:grid-cols-2"
          onSubmit={handleSubmit(async (values) => {
            await onSubmit(values, setError);
          })}
        >
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Type</span>
            <select
              className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
              {...register("type")}
            >
              <option value="INCOME">Income</option>
              <option value="EXPENSE">Expense</option>
            </select>
            {errors.type ? <span className="mt-1 block text-xs text-rose-600">{errors.type.message}</span> : null}
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Amount</span>
            <input
              type="text"
              inputMode="decimal"
              placeholder="0.00"
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
              {...register("amount")}
            />
            {errors.amount ? <span className="mt-1 block text-xs text-rose-600">{errors.amount.message}</span> : null}
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Account</span>
            <select
              className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
              {...register("accountId")}
            >
              <option value="">Select account</option>
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name}
                </option>
              ))}
            </select>
            {errors.accountId ? (
              <span className="mt-1 block text-xs text-rose-600">{errors.accountId.message}</span>
            ) : null}
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Category</span>
            <select
              className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
              {...register("categoryId")}
            >
              <option value="">Select category</option>
              {categoryOptions.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {errors.categoryId ? (
              <span className="mt-1 block text-xs text-rose-600">{errors.categoryId.message}</span>
            ) : null}
          </label>

          <label className="block sm:col-span-2">
            <span className="text-sm font-medium text-slate-700">Occurred at</span>
            <input
              type="datetime-local"
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
              {...register("occurredAtLocal")}
            />
            {errors.occurredAtLocal ? (
              <span className="mt-1 block text-xs text-rose-600">{errors.occurredAtLocal.message}</span>
            ) : null}
          </label>

          <label className="block sm:col-span-2">
            <span className="text-sm font-medium text-slate-700">Note</span>
            <textarea
              rows={3}
              maxLength={500}
              className="mt-1 w-full resize-none rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
              placeholder="Optional note"
              {...register("note")}
            />
            {errors.note ? <span className="mt-1 block text-xs text-rose-600">{errors.note.message}</span> : null}
          </label>

          <button
            type="submit"
            disabled={isSubmitting || accounts.length === 0 || categoryOptions.length === 0}
            className="sm:col-span-2 w-full rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:bg-primary-300"
          >
            {isSubmitting ? "Saving..." : submitLabel}
          </button>
        </form>
      </section>
    </div>
  );
};

const TransactionsLoadingState = () => (
  <section className="rounded-2xl border border-slate-200 bg-white p-5">
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="animate-pulse rounded-xl border border-slate-100 px-4 py-3">
          <div className="h-4 w-40 rounded bg-slate-200" />
          <div className="mt-2 h-3 w-24 rounded bg-slate-100" />
        </div>
      ))}
    </div>
  </section>
);

const currentMonth = new Date().toISOString().slice(0, 7);

export const TransactionsPage = () => {
  const queryClient = useQueryClient();
  const { accessToken, user } = useAuthSession();
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<"ALL" | TransactionType>("ALL");
  const [selectedAccountFilter, setSelectedAccountFilter] = useState<string>("ALL");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);
  const [pageError, setPageError] = useState<string | null>(null);
  const [deletePendingId, setDeletePendingId] = useState<string | null>(null);
  const [expandedTransactionId, setExpandedTransactionId] = useState<string | null>(null);

  const accountsQuery = useQuery({
    queryKey: ["accounts", "transactions"],
    enabled: Boolean(accessToken),
    queryFn: () => getAccounts(accessToken as string)
  });

  const categoriesQuery = useQuery({
    queryKey: ["categories", "transactions"],
    enabled: Boolean(accessToken),
    queryFn: () => getCategories(accessToken as string)
  });

  const transactionsQuery = useQuery({
    queryKey: [
      "transactions",
      selectedMonth,
      selectedTypeFilter,
      selectedAccountFilter,
      selectedCategoryFilter
    ],
    enabled: Boolean(accessToken),
    queryFn: () =>
      getTransactions(accessToken as string, {
        month: selectedMonth,
        type: selectedTypeFilter === "ALL" ? undefined : selectedTypeFilter,
        accountId: selectedAccountFilter === "ALL" ? undefined : selectedAccountFilter,
        categoryId: selectedCategoryFilter === "ALL" ? undefined : selectedCategoryFilter
      })
  });

  const journalQuery = useQuery({
    queryKey: ["transactions", "journal", expandedTransactionId],
    enabled: Boolean(accessToken) && Boolean(user?.learningModeEnabled) && Boolean(expandedTransactionId),
    queryFn: () => getTransactionJournal(accessToken as string, expandedTransactionId as string)
  });

  const createTransactionMutation = useMutation({
    mutationFn: (payload: CreateTransactionRequest) => createTransaction(accessToken as string, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["transactions"] });
    }
  });

  const updateTransactionMutation = useMutation({
    mutationFn: (params: { transactionId: string; payload: CreateTransactionRequest }) =>
      updateTransaction(accessToken as string, params.transactionId, params.payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["transactions"] });
    }
  });

  const deleteTransactionMutation = useMutation({
    mutationFn: (transactionId: string) => deleteTransaction(accessToken as string, transactionId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["transactions"] });
    }
  });

  const accounts = useMemo(() => accountsQuery.data?.accounts ?? [], [accountsQuery.data?.accounts]);
  const categories = useMemo(() => categoriesQuery.data?.categories ?? [], [categoriesQuery.data?.categories]);
  const transactions = useMemo(
    () => transactionsQuery.data?.transactions ?? [],
    [transactionsQuery.data?.transactions]
  );
  const isModalSubmitting = createTransactionMutation.isPending || updateTransactionMutation.isPending;
  const isFilterLoading = accountsQuery.isLoading || categoriesQuery.isLoading;

  const accountNameById = useMemo(() => {
    return new Map(accounts.map((account) => [account.id, account.name]));
  }, [accounts]);

  const categoryById = useMemo(() => {
    return new Map(categories.map((category) => [category.id, category]));
  }, [categories]);

  const categoryOptionsForFilter = useMemo(() => {
    if (selectedTypeFilter === "ALL") {
      return categories;
    }

    return categories.filter((category) => category.type === selectedTypeFilter);
  }, [categories, selectedTypeFilter]);

  useEffect(() => {
    if (selectedCategoryFilter === "ALL") {
      return;
    }

    const selectedCategory = categoryById.get(selectedCategoryFilter);

    if (!selectedCategory) {
      setSelectedCategoryFilter("ALL");
      return;
    }

    if (selectedTypeFilter !== "ALL" && selectedCategory.type !== selectedTypeFilter) {
      setSelectedCategoryFilter("ALL");
    }
  }, [categoryById, selectedCategoryFilter, selectedTypeFilter]);

  useEffect(() => {
    if (user?.learningModeEnabled || !expandedTransactionId) {
      return;
    }

    setExpandedTransactionId(null);
  }, [expandedTransactionId, user?.learningModeEnabled]);

  useEffect(() => {
    if (!expandedTransactionId) {
      return;
    }

    const stillVisible = transactions.some((transaction) => transaction.id === expandedTransactionId);

    if (!stillVisible) {
      setExpandedTransactionId(null);
    }
  }, [expandedTransactionId, transactions]);

  const currencyFormatter = useMemo(() => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: user?.currency ?? "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }, [user?.currency]);

  const dateFormatter = useMemo(() => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit"
    });
  }, []);

  const learningModeEnabled = Boolean(user?.learningModeEnabled);

  const openAddModal = () => {
    setEditingTransaction(null);
    setModalError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setModalError(null);
    setIsModalOpen(true);
  };

  const toggleJournalExpansion = (transactionId: string) => {
    setExpandedTransactionId((current) => (current === transactionId ? null : transactionId));
  };

  const closeModal = () => {
    if (isModalSubmitting) {
      return;
    }

    setIsModalOpen(false);
    setEditingTransaction(null);
    setModalError(null);
  };

  const handleModalSubmit = async (
    values: TransactionFormValues,
    setError: UseFormSetError<TransactionFormValues>
  ) => {
    if (!accessToken) {
      setModalError("Your session expired. Please sign in again.");
      return;
    }

    const selectedCategory = categoryById.get(values.categoryId);

    if (!selectedCategory || selectedCategory.type !== values.type) {
      setError("categoryId", {
        type: "manual",
        message: "Category must match transaction type."
      });
      setModalError("Choose a category that matches the selected type.");
      return;
    }

    const occurredAtIso = toIsoDateTime(values.occurredAtLocal);

    if (!occurredAtIso) {
      setError("occurredAtLocal", {
        type: "manual",
        message: "Occurred at date/time is invalid."
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
      note: note ? note : undefined
    };

    setModalError(null);
    setPageError(null);

    try {
      if (editingTransaction) {
        await updateTransactionMutation.mutateAsync({
          transactionId: editingTransaction.id,
          payload
        });
      } else {
        await createTransactionMutation.mutateAsync(payload);
      }

      closeModal();
    } catch (error) {
      setModalError(applyApiFormErrors(error, setError));
    }
  };

  const handleDeleteTransaction = async (transaction: Transaction) => {
    if (!accessToken) {
      setPageError("Your session expired. Please sign in again.");
      return;
    }

    const confirmed = window.confirm("Delete this transaction? This action cannot be undone.");

    if (!confirmed) {
      return;
    }

    if (expandedTransactionId === transaction.id) {
      setExpandedTransactionId(null);
    }

    setPageError(null);
    setDeletePendingId(transaction.id);

    try {
      await deleteTransactionMutation.mutateAsync(transaction.id);
    } catch (error) {
      setPageError(getApiErrorMessage(error, "Failed to delete transaction."));
    } finally {
      setDeletePendingId(null);
    }
  };

  return (
    <>
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Transaction log</h2>
            <p className="mt-1 text-sm text-slate-600">Track income and expenses with account and category filters.</p>
          </div>
          <button
            type="button"
            onClick={openAddModal}
            disabled={isFilterLoading || accounts.length === 0 || categories.length === 0}
            className="rounded-xl bg-primary-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:bg-primary-300"
          >
            Add transaction
          </button>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          <label className="block">
            <span className="text-xs font-medium uppercase tracking-wide text-slate-500">Month</span>
            <input
              type="month"
              value={selectedMonth}
              onChange={(event) => setSelectedMonth(event.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
            />
          </label>

          <label className="block">
            <span className="text-xs font-medium uppercase tracking-wide text-slate-500">Type</span>
            <select
              value={selectedTypeFilter}
              onChange={(event) => setSelectedTypeFilter(event.target.value as "ALL" | TransactionType)}
              className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
            >
              <option value="ALL">All types</option>
              <option value="INCOME">Income only</option>
              <option value="EXPENSE">Expense only</option>
            </select>
          </label>

          <label className="block">
            <span className="text-xs font-medium uppercase tracking-wide text-slate-500">Account</span>
            <select
              value={selectedAccountFilter}
              onChange={(event) => setSelectedAccountFilter(event.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
            >
              <option value="ALL">All accounts</option>
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-xs font-medium uppercase tracking-wide text-slate-500">Category</span>
            <select
              value={selectedCategoryFilter}
              onChange={(event) => setSelectedCategoryFilter(event.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
            >
              <option value="ALL">All categories</option>
              {categoryOptionsForFilter.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>
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
                void transactionsQuery.refetch();
              }}
              className="rounded-lg border border-rose-200 bg-white px-3 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-100"
            >
              Retry
            </button>
          </div>
        </section>
      ) : null}

      <section className="mt-4">
        {transactionsQuery.isLoading ? <TransactionsLoadingState /> : null}

        {!transactionsQuery.isLoading && transactionsQuery.isError ? (
          <section className="rounded-2xl border border-rose-200 bg-rose-50 p-5">
            <h3 className="text-sm font-semibold text-rose-700">Could not load transactions</h3>
            <p className="mt-1 text-sm text-rose-600">
              {getApiErrorMessage(transactionsQuery.error, "Please try again in a few seconds.")}
            </p>
            <button
              type="button"
              onClick={() => void transactionsQuery.refetch()}
              className="mt-4 rounded-lg border border-rose-200 bg-white px-3 py-2 text-sm font-medium text-rose-700 hover:bg-rose-100"
            >
              Retry
            </button>
          </section>
        ) : null}

        {!transactionsQuery.isLoading && !transactionsQuery.isError && transactions.length === 0 ? (
          <section className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
            <h3 className="text-base font-semibold text-slate-900">No transactions for this filter</h3>
            <p className="mt-2 text-sm text-slate-600">
              Add your first transaction for {selectedMonth} to start building reports.
            </p>
            <button
              type="button"
              onClick={openAddModal}
              disabled={accounts.length === 0 || categories.length === 0}
              className="mt-5 rounded-xl bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:cursor-not-allowed disabled:bg-primary-300"
            >
              Create first transaction
            </button>
          </section>
        ) : null}

        {!transactionsQuery.isLoading && !transactionsQuery.isError && transactions.length > 0 ? (
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <ul className="divide-y divide-slate-100">
              {transactions.map((transaction) => {
                const amountColor = transaction.type === "INCOME" ? "text-emerald-700" : "text-primary-700";
                const transactionAmountCents = moneyStringToCents(transaction.amount);
                const signedAmount = `${transaction.type === "INCOME" ? "+" : "-"}${formatMoneyCents(
                  currencyFormatter,
                  transactionAmountCents
                )}`;
                const category = categoryById.get(transaction.categoryId);
                const accountName = accountNameById.get(transaction.accountId) ?? "Unknown account";
                const isDeleting =
                  deleteTransactionMutation.isPending && deletePendingId === transaction.id;
                const isExpanded = expandedTransactionId === transaction.id;
                const journalEntries = isExpanded ? journalQuery.data?.journalEntries ?? [] : [];
                const isJournalLoading = isExpanded && journalQuery.isLoading;
                const journalErrorMessage =
                  isExpanded && journalQuery.isError
                    ? getApiErrorMessage(journalQuery.error, "Could not load journal entries.")
                    : null;
                const debitTotalCents = journalEntries.reduce(
                  (total, entry) =>
                    entry.side === "DEBIT" ? total + moneyStringToCents(entry.amount) : total,
                  0n
                );
                const creditTotalCents = journalEntries.reduce(
                  (total, entry) =>
                    entry.side === "CREDIT" ? total + moneyStringToCents(entry.amount) : total,
                  0n
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
                        <p className="truncate text-sm font-semibold text-slate-900">
                          {category?.name ?? "Unknown category"}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {dateFormatter.format(new Date(transaction.occurredAt))} - {accountName}
                        </p>
                        {transaction.note ? (
                          <p className="mt-2 text-sm text-slate-600">{transaction.note}</p>
                        ) : null}
                        <div className="mt-2 flex flex-wrap gap-2">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${transactionTypeBadgeClass[transaction.type]}`}
                          >
                            {transactionTypeLabel[transaction.type]}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        <p className={`text-sm font-semibold ${amountColor}`}>{signedAmount}</p>
                        {learningModeEnabled ? (
                          <button
                            type="button"
                            onClick={() => toggleJournalExpansion(transaction.id)}
                            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                          >
                            {isExpanded ? "Hide journal" : "Show journal"}
                          </button>
                        ) : null}
                        <button
                          type="button"
                          onClick={() => openEditModal(transaction)}
                          className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleDeleteTransaction(transaction)}
                          disabled={isDeleting}
                          className="rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {isDeleting ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </div>

                    {learningModeEnabled && isExpanded ? (
                      <section className="mt-4 rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <h4 className="text-sm font-semibold text-slate-900">Journal entries</h4>
                          {journalEntries.length > 0 ? (
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                                isJournalBalanced
                                  ? "border border-sage-200 bg-sage-100/70 text-emerald-800"
                                  : "border border-rose-200 bg-rose-100 text-rose-700"
                              }`}
                            >
                              {isJournalBalanced ? `Balanced (${journalBalanceText})` : "Unbalanced"}
                            </span>
                          ) : null}
                        </div>
                        <p className="mt-1 text-xs text-slate-600">{journalExplanation}</p>

                        {isJournalLoading ? (
                          <div className="mt-3 animate-pulse space-y-2">
                            <div className="h-8 rounded-lg bg-slate-200" />
                            <div className="h-8 rounded-lg bg-slate-200" />
                          </div>
                        ) : null}

                        {journalErrorMessage ? (
                          <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <span>{journalErrorMessage}</span>
                              <button
                                type="button"
                                onClick={() => void journalQuery.refetch()}
                                className="rounded-md border border-rose-200 bg-white px-2.5 py-1 text-xs font-medium text-rose-700 hover:bg-rose-100"
                              >
                                Retry
                              </button>
                            </div>
                          </div>
                        ) : null}

                        {!isJournalLoading && !journalErrorMessage && journalEntries.length === 0 ? (
                          <p className="mt-3 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600">
                            No journal entries found for this transaction.
                          </p>
                        ) : null}

                        {!isJournalLoading && !journalErrorMessage && journalEntries.length > 0 ? (
                          <div className="mt-3 overflow-hidden rounded-lg border border-slate-200 bg-white">
                            <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
                              <thead className="bg-slate-50 text-slate-600">
                                <tr>
                                  <th className="px-3 py-2 font-medium">Side</th>
                                  <th className="px-3 py-2 font-medium">Account Type</th>
                                  <th className="px-3 py-2 font-medium">Label</th>
                                  <th className="px-3 py-2 text-right font-medium">Amount</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 text-slate-700">
                                {journalEntries.map((entry) => (
                                  <tr key={entry.id}>
                                    <td className="px-3 py-2">{journalSideLabel[entry.side]}</td>
                                    <td className="px-3 py-2">{journalAccountTypeLabel[entry.accountType]}</td>
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
        ) : null}
      </section>

      <TransactionModal
        transaction={editingTransaction}
        accounts={accounts}
        categories={categories}
        isOpen={isModalOpen}
        isSubmitting={isModalSubmitting}
        errorMessage={modalError}
        onClose={closeModal}
        onSubmit={handleModalSubmit}
      />
    </>
  );
};

