import type { Category } from "@sft/shared";
import { Archive, Loader2, Pencil } from "lucide-react";
import { categoryTypeBadgeClass, categoryTypeLabel } from "../constants";

type CategoriesListProps = {
  categories: Category[];
  archivingCategoryId: string | null;
  onEdit: (category: Category) => void;
  onArchive: (category: Category) => void;
};

export const CategoriesList = ({
  categories,
  archivingCategoryId,
  onEdit,
  onArchive,
}: CategoriesListProps) => (
  <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
    <ul className="divide-y divide-slate-100">
      {categories.map((category) => {
        const isArchivingCurrent = archivingCategoryId === category.id;

        return (
          <li
            key={category.id}
            className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0">
              <p className="truncate text-base font-semibold text-slate-900">{category.name}</p>
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
                onClick={() => onEdit(category)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50"
                aria-label={`Edit ${category.name}`}
                title="Edit category"
              >
                <Pencil className="h-4 w-4" aria-hidden="true" />
                <span className="sr-only">Edit</span>
              </button>
              <button
                type="button"
                onClick={() => onArchive(category)}
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
                <span className="sr-only">{isArchivingCurrent ? "Archiving..." : "Archive"}</span>
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  </section>
);
