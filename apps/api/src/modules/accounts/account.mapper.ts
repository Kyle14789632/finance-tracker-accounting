import type { Account as AccountRecord } from "../../../prisma/generated/client";
import type { Account, AccountType } from "@sft/shared";

export const toAccount = (account: AccountRecord): Account => ({
  id: account.id,
  name: account.name,
  type: account.type as AccountType,
  isArchived: account.isArchived,
  createdAt: account.createdAt.toISOString(),
  updatedAt: account.updatedAt.toISOString(),
});
