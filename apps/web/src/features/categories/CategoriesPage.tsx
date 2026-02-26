import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Category, CategoryType, CreateCategoryRequest } from "@sft/shared";
import { Archive, Loader2, Pencil, Tags, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import type { UseFormSetError } from "react-hook-form";
import { Controller, useForm } from "react-hook-form";
import { SelectMenuField, type SelectMenuOption } from "../../components/ui/SelectMenuField";
import { applyApiFormErrors, getApiErrorMessage } from "../../utils/api-errors";
import { useAuthSession } from "../auth/auth-session-context";
import { archiveCategory, createCategory, getCategories, updateCategory } from "./api";
import { createCategoryRequestSchema } from "./schemas";

type CategoryModalProps = {
  category: Category | null;
  isOpen: boolean;
  isSubmitting: boolean;
  errorMessage: string | null;
  onClose: () => void;
  onSubmit: (
    values: CreateCategoryRequest,
    setError: UseFormSetError<CreateCategoryRequest>,
  ) => Promise<void>;
};

const categoryTypeLabel: Record<CategoryType, string> = {
  INCOME: "Income",
  EXPENSE: "Expense",
};

const categoryTypeBadgeClass: Record<CategoryType, string> = {
  INCOME: "border border-sage-100 bg-sage-100/60 text-emerald-800",
  EXPENSE: "border border-primary-100 bg-primary-50 text-primary-700",
};

const categoryTypeOptions: SelectMenuOption[] = [
  {
    value: "INCOME",
    label: "Income",
    helperText: "Money received",
  },
  {
    value: "EXPENSE",
    label: "Expense",
    helperText: "Money spent",
  },
];

const categoryTypeFilterOptions: SelectMenuOption[] = [
  {
    value: "ALL",
    label: "All types",
  },
  {
    value: "INCOME",
    label: "Income only",
  },
  {
    value: "EXPENSE",
    label: "Expense only",
  },
];

const CategoryModal = ({
  category,
  isOpen,
  isSubmitting,
  errorMessage,
  onClose,
  onSubmit,
}: CategoryModalProps) => {
  const {
    control,
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<CreateCategoryRequest>({
    resolver: zodResolver(createCategoryRequestSchema),
    defaultValues: {
      name: "",
      type: "EXPENSE",
    },
  });

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    reset({
      name: category?.name ?? "",
      type: category?.type ?? "EXPENSE",
    });
  }, [category, isOpen, reset]);

  if (!isOpen) {
    return null;
  }

  const title = category ? "Edit category" : "Add category";
  const submitLabel = category ? "Save changes" : "Create category";

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/30 px-4 py-8">
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
            <p className="mt-1 text-base text-slate-600">
              Use this category in your transactions module.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Close
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
                  ariaLabel="Select category type"
                  value={field.value}
                  onChange={(nextValue) => {
                    field.onChange(nextValue as CategoryType);
                  }}
                  options={categoryTypeOptions}
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

const CategoriesLoadingState = () => (
  <section className="rounded-2xl border border-slate-200 bg-white p-5">
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="animate-pulse rounded-xl border border-slate-100 px-4 py-3">
          <div className="h-4 w-28 rounded bg-slate-200" />
          <div className="mt-2 h-3 w-16 rounded bg-slate-100" />
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

export const CategoriesPage = () => {
  const queryClient = useQueryClient();
  const { accessToken } = useAuthSession();
  const [activeTypeFilter, setActiveTypeFilter] = useState<"ALL" | CategoryType>("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);
  const [pageError, setPageError] = useState<string | null>(null);
  const [archivePendingId, setArchivePendingId] = useState<string | null>(null);

  const categoriesQuery = useQuery({
    queryKey: ["categories", activeTypeFilter],
    enabled: Boolean(accessToken),
    queryFn: () =>
      getCategories(
        accessToken as string,
        activeTypeFilter === "ALL" ? {} : { type: activeTypeFilter },
      ),
  });

  const createCategoryMutation = useMutation({
    mutationFn: (payload: CreateCategoryRequest) => createCategory(accessToken as string, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: (params: { categoryId: string; payload: CreateCategoryRequest }) =>
      updateCategory(accessToken as string, params.categoryId, params.payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });

  const archiveCategoryMutation = useMutation({
    mutationFn: (categoryId: string) => archiveCategory(accessToken as string, categoryId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });

  const categories = useMemo(
    () => categoriesQuery.data?.categories ?? [],
    [categoriesQuery.data?.categories],
  );
  const isModalSubmitting = createCategoryMutation.isPending || updateCategoryMutation.isPending;

  const openAddModal = () => {
    setEditingCategory(null);
    setModalError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    setModalError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (isModalSubmitting) {
      return;
    }

    setIsModalOpen(false);
    setEditingCategory(null);
    setModalError(null);
  };

  const handleModalSubmit = async (
    values: CreateCategoryRequest,
    setError: UseFormSetError<CreateCategoryRequest>,
  ) => {
    if (!accessToken) {
      setModalError("Your session expired. Please sign in again.");
      return;
    }

    setModalError(null);
    setPageError(null);

    try {
      if (editingCategory) {
        await updateCategoryMutation.mutateAsync({
          categoryId: editingCategory.id,
          payload: values,
        });
      } else {
        await createCategoryMutation.mutateAsync(values);
      }

      closeModal();
    } catch (error) {
      setModalError(applyApiFormErrors(error, setError));
    }
  };

  const handleArchive = async (category: Category) => {
    if (!accessToken) {
      setPageError("Your session expired. Please sign in again.");
      return;
    }

    const confirmed = window.confirm(
      `Archive "${category.name}"? You can no longer use it for new transactions.`,
    );

    if (!confirmed) {
      return;
    }

    setPageError(null);
    setArchivePendingId(category.id);

    try {
      await archiveCategoryMutation.mutateAsync(category.id);
    } catch (error) {
      setPageError(getApiErrorMessage(error, "Failed to archive category."));
    } finally {
      setArchivePendingId(null);
    }
  };

  return (
    <>
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Category library</h2>
            <p className="mt-1 text-base text-slate-600">
              Create income and expense categories for upcoming modules.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <FilterField icon={Tags}>
              <SelectMenuField
                ariaLabel="Filter by category type"
                value={activeTypeFilter}
                onChange={(nextValue) => setActiveTypeFilter(nextValue as "ALL" | CategoryType)}
                options={categoryTypeFilterOptions}
                variant="plain"
                menuClassName="left-0 right-0"
              />
            </FilterField>
            <button
              type="button"
              onClick={openAddModal}
              className="rounded-xl bg-primary-600 px-4 py-2.5 text-base font-medium text-white transition hover:bg-primary-700"
            >
              Add category
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
                void categoriesQuery.refetch();
              }}
              className="rounded-lg border border-rose-200 bg-white px-3 py-1.5 text-sm font-medium text-rose-700 hover:bg-rose-100"
            >
              Retry
            </button>
          </div>
        </section>
      ) : null}

      <section className="mt-4">
        {categoriesQuery.isLoading ? <CategoriesLoadingState /> : null}

        {!categoriesQuery.isLoading && categoriesQuery.isError ? (
          <section className="rounded-2xl border border-rose-200 bg-rose-50 p-5">
            <h3 className="text-base font-semibold text-rose-700">Could not load categories</h3>
            <p className="mt-1 text-base text-rose-600">
              {getApiErrorMessage(categoriesQuery.error, "Please try again in a few seconds.")}
            </p>
            <button
              type="button"
              onClick={() => void categoriesQuery.refetch()}
              className="mt-4 rounded-lg border border-rose-200 bg-white px-3 py-2 text-base font-medium text-rose-700 hover:bg-rose-100"
            >
              Retry
            </button>
          </section>
        ) : null}

        {!categoriesQuery.isLoading && !categoriesQuery.isError && categories.length === 0 ? (
          <section className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
            <h3 className="text-lg font-semibold text-slate-900">No categories yet</h3>
            <p className="mt-2 text-base text-slate-600">
              Add your first category to prepare for transaction tracking.
            </p>
            <button
              type="button"
              onClick={openAddModal}
              className="mt-5 rounded-xl bg-primary-600 px-4 py-2.5 text-base font-medium text-white hover:bg-primary-700"
            >
              Create first category
            </button>
          </section>
        ) : null}

        {!categoriesQuery.isLoading && !categoriesQuery.isError && categories.length > 0 ? (
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <ul className="divide-y divide-slate-100">
              {categories.map((category) => {
                const isArchivingCurrent =
                  archiveCategoryMutation.isPending && archivePendingId === category.id;

                return (
                  <li
                    key={category.id}
                    className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-base font-semibold text-slate-900">
                        {category.name}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-sm font-medium ${categoryTypeBadgeClass[category.type]}`}
                        >
                          {categoryTypeLabel[category.type]}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => openEditModal(category)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50"
                        aria-label={`Edit ${category.name}`}
                        title="Edit category"
                      >
                        <Pencil className="h-4 w-4" aria-hidden="true" />
                        <span className="sr-only">Edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleArchive(category)}
                        disabled={isArchivingCurrent}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-rose-200 text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                        aria-label={`Archive ${category.name}`}
                        title="Archive category"
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

      <CategoryModal
        category={editingCategory}
        isOpen={isModalOpen}
        isSubmitting={isModalSubmitting}
        errorMessage={modalError}
        onClose={closeModal}
        onSubmit={handleModalSubmit}
      />
    </>
  );
};
