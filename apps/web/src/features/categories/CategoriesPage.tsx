import type { Category, CategoryType, CreateCategoryRequest } from "@sft/shared";
import { Tags } from "lucide-react";
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
import { CategoriesList } from "./components/CategoriesList";
import { CategoryFormModal } from "./components/CategoryFormModal";
import { categoryTypeFilterOptions, categoryTypeLabel } from "./constants";
import { useCategoriesQuery } from "./hooks/useCategoriesQuery";
import { useCategoryMutations } from "./hooks/useCategoryMutations";

export const CategoriesPage = () => {
  const { accessToken } = useAuthSession();
  const [activeTypeFilter, setActiveTypeFilter] = useState<"ALL" | CategoryType>("ALL");
  const [modalError, setModalError] = useState<string | null>(null);
  const [pageError, setPageError] = useState<string | null>(null);
  const [archiveModalError, setArchiveModalError] = useState<string | null>(null);
  const [archivePendingId, setArchivePendingId] = useState<string | null>(null);
  const {
    isEditModalOpen,
    editingEntity: editingCategory,
    entityToArchive: categoryToArchive,
    openCreate,
    openEdit,
    closeEdit,
    openArchive,
    closeArchive,
  } = useEntityDialogs<Category>();

  const categoriesQuery = useCategoriesQuery(accessToken, activeTypeFilter);
  const { createCategoryMutation, updateCategoryMutation, archiveCategoryMutation } =
    useCategoryMutations(accessToken);

  const categories = useMemo(
    () => categoriesQuery.data?.categories ?? [],
    [categoriesQuery.data?.categories],
  );
  const isModalSubmitting = createCategoryMutation.isPending || updateCategoryMutation.isPending;
  const isArchiveSubmitting =
    archiveCategoryMutation.isPending && archivePendingId === categoryToArchive?.id;
  const archiveCategoryType = categoryToArchive ? categoryTypeLabel[categoryToArchive.type] : "";
  const archivingCategoryId = archiveCategoryMutation.isPending ? archivePendingId : null;

  const openAddModal = () => {
    setModalError(null);
    openCreate();
  };

  const openEditModal = (category: Category) => {
    setModalError(null);
    openEdit(category);
  };

  const closeModal = () => {
    if (isModalSubmitting) {
      return;
    }

    setModalError(null);
    closeEdit();
  };

  const openArchiveModal = (category: Category) => {
    setArchiveModalError(null);
    openArchive(category);
  };

  const closeArchiveModal = () => {
    if (isArchiveSubmitting) {
      return;
    }

    setArchiveModalError(null);
    closeArchive();
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

  const handleArchive = async () => {
    if (!categoryToArchive) {
      return;
    }

    if (!accessToken) {
      setArchiveModalError("Your session expired. Please sign in again.");
      return;
    }

    setPageError(null);
    setArchiveModalError(null);
    setArchivePendingId(categoryToArchive.id);

    try {
      await archiveCategoryMutation.mutateAsync(categoryToArchive.id);
      closeArchiveModal();
    } catch (error) {
      setArchiveModalError(getApiErrorMessage(error, "Failed to archive category."));
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
        {categoriesQuery.isLoading ? (
          <CrudLoadingListCard
            rowCount={4}
            titleWidthClassName="w-28"
            subtitleWidthClassName="w-16"
          />
        ) : null}

        {!categoriesQuery.isLoading && categoriesQuery.isError ? (
          <CrudErrorCard
            title="Could not load categories"
            message={getApiErrorMessage(
              categoriesQuery.error,
              "Please try again in a few seconds.",
            )}
            onRetry={() => {
              void categoriesQuery.refetch();
            }}
          />
        ) : null}

        {!categoriesQuery.isLoading && !categoriesQuery.isError && categories.length === 0 ? (
          <CrudEmptyStateCard
            title="No categories yet"
            description="Add your first category to prepare for transaction tracking."
            actionLabel="Create first category"
            onAction={openAddModal}
          />
        ) : null}

        {!categoriesQuery.isLoading && !categoriesQuery.isError && categories.length > 0 ? (
          <CategoriesList
            categories={categories}
            archivingCategoryId={archivingCategoryId}
            onEdit={openEditModal}
            onArchive={openArchiveModal}
          />
        ) : null}
      </section>

      <CategoryFormModal
        category={editingCategory}
        isOpen={isEditModalOpen}
        isSubmitting={isModalSubmitting}
        errorMessage={modalError}
        onClose={closeModal}
        onSubmit={handleModalSubmit}
      />

      <EntityArchiveConfirmModal
        isOpen={Boolean(categoryToArchive)}
        isSubmitting={isArchiveSubmitting}
        title="Archive category"
        description="Archived categories can no longer be used for new transactions."
        entityName={categoryToArchive?.name ?? ""}
        entityMeta={archiveCategoryType}
        errorMessage={archiveModalError}
        onCancel={closeArchiveModal}
        onConfirm={() => {
          void handleArchive();
        }}
      />
    </>
  );
};
