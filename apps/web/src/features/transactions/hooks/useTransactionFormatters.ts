import type { Category, Transaction } from "@sft/shared";
import { useMemo } from "react";
import { formatMoneyCents, moneyStringToCents } from "../../../utils/money";

type UseTransactionFormattersResult = {
  currencyFormatter: Intl.NumberFormat;
  dateFormatter: Intl.DateTimeFormat;
  deleteTransactionCategoryLabel: string;
  deleteTransactionAmountLabel: string;
  deleteTransactionOccurredAtLabel: string;
};

export const useTransactionFormatters = (
  currency: string | undefined,
  transactionToDelete: Transaction | null,
  categoryById: Map<string, Category>,
): UseTransactionFormattersResult => {
  const currencyFormatter = useMemo(() => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency ?? "PHP",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }, [currency]);

  const dateFormatter = useMemo(() => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }, []);

  const deleteTransactionCategoryLabel = transactionToDelete
    ? (categoryById.get(transactionToDelete.categoryId)?.name ?? "Unknown category")
    : "";

  const deleteTransactionAmountLabel = transactionToDelete
    ? `${transactionToDelete.type === "INCOME" ? "+" : "-"}${formatMoneyCents(
        currencyFormatter,
        moneyStringToCents(transactionToDelete.amount),
      )}`
    : "";

  const deleteTransactionOccurredAtLabel = transactionToDelete
    ? dateFormatter.format(new Date(transactionToDelete.occurredAt))
    : "";

  return {
    currencyFormatter,
    dateFormatter,
    deleteTransactionCategoryLabel,
    deleteTransactionAmountLabel,
    deleteTransactionOccurredAtLabel,
  };
};
