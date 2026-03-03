import { zodResolver } from "@hookform/resolvers/zod";
import type { Account, Category, Transaction, TransactionType } from "@sft/shared";
import { CalendarDays, X } from "lucide-react";
import { useCallback, useEffect } from "react";
import type { UseFormSetError } from "react-hook-form";
import { Controller, useForm } from "react-hook-form";
import { DateTimePickerField } from "../../../components/ui/DateTimePickerField";
import { SelectMenuField } from "../../../components/ui/SelectMenuField";
import { modalTransactionTypeOptions } from "../constants";
import {
  getDefaultOccurredAtLocal,
  toDateTimeLocal,
  transactionFormSchema,
  type TransactionFormValues,
} from "../form";

type TransactionFormModalProps = {
  transaction: Transaction | null;
  accounts: Account[];
  categories: Category[];
  isOpen: boolean;
  isSubmitting: boolean;
  errorMessage: string | null;
  onClose: () => void;
  onSubmit: (
    values: TransactionFormValues,
    setError: UseFormSetError<TransactionFormValues>,
  ) => Promise<void>;
};

export const TransactionFormModal = ({
  transaction,
  accounts,
  categories,
  isOpen,
  isSubmitting,
  errorMessage,
  onClose,
  onSubmit,
}: TransactionFormModalProps) => {
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
    watch,
    setValue,
    getValues,
    setError,
    formState: { errors },
  } = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: {
      accountId: "",
      categoryId: "",
      type: "EXPENSE",
      amount: "",
      occurredAtLocal: getDefaultOccurredAtLocal(),
      note: "",
    },
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
      occurredAtLocal: transaction
        ? toDateTimeLocal(transaction.occurredAt)
        : getDefaultOccurredAtLocal(),
      note: transaction?.note ?? "",
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
      shouldValidate: true,
    });
  }, [categories, getValues, isOpen, selectedType, setValue]);

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

  const title = transaction ? "Edit transaction" : "Add transaction";
  const submitLabel = transaction ? "Save changes" : "Create transaction";
  const categoryOptions = categories.filter((category) => category.type === selectedType);

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center overflow-y-auto bg-slate-900/30 px-4 py-6 sm:py-8"
      onClick={requestClose}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="transaction-modal-title"
        className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="transaction-modal-title" className="text-xl font-semibold text-slate-900">
              {title}
            </h2>
            <p className="mt-1 text-base text-slate-600">
              Capture amount, account, category, and date in one place.
            </p>
          </div>
          <button
            type="button"
            onClick={requestClose}
            disabled={isSubmitting}
            aria-label="Close transaction modal"
            title="Close"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <X className="h-4 w-4" aria-hidden="true" />
            <span className="sr-only">Close transaction modal</span>
          </button>
        </div>

        {errorMessage ? (
          <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-base text-rose-700">
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
            <span className="text-base font-medium text-slate-700">Type</span>
            <Controller
              control={control}
              name="type"
              render={({ field }) => (
                <SelectMenuField
                  className="mt-1"
                  ariaLabel="Select transaction type"
                  value={field.value}
                  onChange={(nextValue) => {
                    field.onChange(nextValue as TransactionType);
                  }}
                  options={modalTransactionTypeOptions}
                />
              )}
            />
            {errors.type ? (
              <span className="mt-1 block text-sm text-rose-600">{errors.type.message}</span>
            ) : null}
          </label>

          <label className="block">
            <span className="text-base font-medium text-slate-700">Amount</span>
            <input
              type="text"
              inputMode="decimal"
              placeholder="0.00"
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-base outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
              {...register("amount")}
            />
            {errors.amount ? (
              <span className="mt-1 block text-sm text-rose-600">{errors.amount.message}</span>
            ) : null}
          </label>

          <label className="block">
            <span className="text-base font-medium text-slate-700">Account</span>
            <Controller
              control={control}
              name="accountId"
              render={({ field }) => (
                <SelectMenuField
                  className="mt-1"
                  ariaLabel="Select account"
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Select account"
                  options={accounts.map((account) => ({
                    value: account.id,
                    label: account.name,
                  }))}
                />
              )}
            />
            {errors.accountId ? (
              <span className="mt-1 block text-sm text-rose-600">{errors.accountId.message}</span>
            ) : null}
          </label>

          <label className="block">
            <span className="text-base font-medium text-slate-700">Category</span>
            <Controller
              control={control}
              name="categoryId"
              render={({ field }) => (
                <SelectMenuField
                  className="mt-1"
                  ariaLabel="Select category"
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Select category"
                  options={categoryOptions.map((category) => ({
                    value: category.id,
                    label: category.name,
                  }))}
                />
              )}
            />
            {errors.categoryId ? (
              <span className="mt-1 block text-sm text-rose-600">{errors.categoryId.message}</span>
            ) : null}
          </label>

          <div className="block sm:col-span-2">
            <span className="text-base font-medium text-slate-700">Occurred at</span>
            <Controller
              control={control}
              name="occurredAtLocal"
              render={({ field }) => (
                <DateTimePickerField
                  className="mt-1"
                  value={field.value}
                  onChange={(nextDateTime) => {
                    field.onChange(nextDateTime);
                    field.onBlur();
                  }}
                  icon={CalendarDays}
                  ariaLabel="Select occurred date and time"
                />
              )}
            />
            {errors.occurredAtLocal ? (
              <span className="mt-1 block text-sm text-rose-600">
                {errors.occurredAtLocal.message}
              </span>
            ) : null}
          </div>

          <label className="block sm:col-span-2">
            <span className="text-base font-medium text-slate-700">Note</span>
            <textarea
              rows={3}
              maxLength={500}
              className="mt-1 w-full resize-none rounded-xl border border-slate-300 px-3 py-2.5 text-base outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
              placeholder="Optional note"
              {...register("note")}
            />
            {errors.note ? (
              <span className="mt-1 block text-sm text-rose-600">{errors.note.message}</span>
            ) : null}
          </label>

          <button
            type="submit"
            disabled={isSubmitting || accounts.length === 0 || categoryOptions.length === 0}
            className="w-full rounded-xl bg-primary-600 px-4 py-2.5 text-base font-medium text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:bg-primary-300 sm:col-span-2"
          >
            {isSubmitting ? "Saving..." : submitLabel}
          </button>
        </form>
      </section>
    </div>
  );
};

export type { TransactionFormValues };
