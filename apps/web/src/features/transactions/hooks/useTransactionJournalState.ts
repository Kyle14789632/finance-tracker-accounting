import type { Transaction } from "@sft/shared";
import { useEffect, useState } from "react";

type UseTransactionJournalStateResult = {
  expandedTransactionId: string | null;
  toggleJournalExpansion: (transactionId: string) => void;
  clearExpandedTransaction: () => void;
};

export const useTransactionJournalState = (
  transactions: Transaction[],
  learningModeEnabled: boolean,
): UseTransactionJournalStateResult => {
  const [expandedTransactionId, setExpandedTransactionId] = useState<string | null>(null);

  useEffect(() => {
    if (learningModeEnabled || !expandedTransactionId) {
      return;
    }

    setExpandedTransactionId(null);
  }, [expandedTransactionId, learningModeEnabled]);

  useEffect(() => {
    if (!expandedTransactionId) {
      return;
    }

    const stillVisible = transactions.some(
      (transaction) => transaction.id === expandedTransactionId,
    );

    if (!stillVisible) {
      setExpandedTransactionId(null);
    }
  }, [expandedTransactionId, transactions]);

  const toggleJournalExpansion = (transactionId: string) => {
    setExpandedTransactionId((current) => (current === transactionId ? null : transactionId));
  };

  const clearExpandedTransaction = () => {
    setExpandedTransactionId(null);
  };

  return {
    expandedTransactionId,
    toggleJournalExpansion,
    clearExpandedTransaction,
  };
};
