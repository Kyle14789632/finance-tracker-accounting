import { Prisma } from "../../../prisma/generated/client";
import type { BalanceSheetAsset, CategoryBreakdownItem } from "@sft/shared";

export const compareBreakdownItems = (
  a: CategoryBreakdownItem,
  b: CategoryBreakdownItem,
): number => {
  const amountComparison = new Prisma.Decimal(b.total).comparedTo(a.total);

  if (amountComparison !== 0) {
    return amountComparison;
  }

  return a.categoryName.localeCompare(b.categoryName);
};

export const compareBalanceSheetAssets = (a: BalanceSheetAsset, b: BalanceSheetAsset): number => {
  const amountComparison = new Prisma.Decimal(b.balance).comparedTo(a.balance);

  if (amountComparison !== 0) {
    return amountComparison;
  }

  return a.accountName.localeCompare(b.accountName);
};
