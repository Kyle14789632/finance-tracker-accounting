import { Loader2, X } from "lucide-react";
import { useEffect } from "react";

type DeleteTransactionModalProps = {
  isOpen: boolean;
  isSubmitting: boolean;
  categoryLabel: string;
  amountLabel: string;
  occurredAtLabel: string;
  errorMessage: string | null;
  onCancel: () => void;
  onConfirm: () => void;
};

export const DeleteTransactionModal = ({
  isOpen,
  isSubmitting,
  categoryLabel,
  amountLabel,
  occurredAtLabel,
  errorMessage,
  onCancel,
  onConfirm,
}: DeleteTransactionModalProps) => {
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
      className="fixed inset-0 z-40 flex items-center justify-center overflow-y-auto bg-slate-900/30 px-4 py-6 sm:py-8"
      onClick={() => {
        if (!isSubmitting) {
          onCancel();
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-transaction-title"
        className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="delete-transaction-title" className="text-xl font-semibold text-slate-900">
              Delete transaction
            </h2>
            <p className="mt-1 text-base text-slate-600">This action cannot be undone.</p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            aria-label="Close delete confirmation"
            title="Close"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <X className="h-4 w-4" aria-hidden="true" />
            <span className="sr-only">Close delete confirmation</span>
          </button>
        </div>

        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
          <p className="text-base font-medium text-slate-900">{categoryLabel}</p>
          <p className="mt-1 text-sm text-slate-600">{occurredAtLabel}</p>
          <p className="mt-1 text-sm font-medium text-slate-700">{amountLabel}</p>
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
            className="inline-flex items-center justify-center rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-medium text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                Deleting...
              </>
            ) : (
              "Delete"
            )}
          </button>
        </div>
      </section>
    </div>
  );
};
