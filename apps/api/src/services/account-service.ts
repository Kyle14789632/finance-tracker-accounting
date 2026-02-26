import type {
  Account as AccountRecord,
  AccountType as PrismaAccountType
} from "../../prisma/generated/client";
import type {
  Account,
  AccountType,
  CreateAccountRequest,
  ListAccountsQuery,
  UpdateAccountRequest
} from "@sft/shared";
import { AppError } from "../utils/app-error";
import { prisma } from "../utils/prisma";

const toAccount = (account: AccountRecord): Account => ({
  id: account.id,
  name: account.name,
  type: account.type as AccountType,
  isArchived: account.isArchived,
  createdAt: account.createdAt.toISOString(),
  updatedAt: account.updatedAt.toISOString()
});

const findActiveAccountOrThrow = async (
  userId: string,
  accountId: string
): Promise<AccountRecord> => {
  const account = await prisma.account.findFirst({
    where: {
      id: accountId,
      userId,
      isArchived: false
    }
  });

  if (!account) {
    throw new AppError(404, "ACCOUNT_NOT_FOUND", "Account not found");
  }

  return account;
};

const listAccounts = async (userId: string, query: ListAccountsQuery): Promise<Account[]> => {
  const accounts = await prisma.account.findMany({
    where: {
      userId,
      isArchived: false,
      type: query.type as PrismaAccountType | undefined
    },
    orderBy: [{ name: "asc" }, { createdAt: "asc" }]
  });

  return accounts.map(toAccount);
};

const createAccount = async (userId: string, payload: CreateAccountRequest): Promise<Account> => {
  const account = await prisma.account.create({
    data: {
      userId,
      name: payload.name,
      type: payload.type as PrismaAccountType
    }
  });

  return toAccount(account);
};

const updateAccount = async (
  userId: string,
  accountId: string,
  payload: UpdateAccountRequest
): Promise<Account> => {
  await findActiveAccountOrThrow(userId, accountId);

  const updatedAccount = await prisma.account.update({
    where: { id: accountId },
    data: {
      name: payload.name,
      type: payload.type as PrismaAccountType
    }
  });

  return toAccount(updatedAccount);
};

const archiveAccount = async (userId: string, accountId: string): Promise<Account> => {
  await findActiveAccountOrThrow(userId, accountId);

  const archivedAccount = await prisma.account.update({
    where: { id: accountId },
    data: {
      isArchived: true
    }
  });

  return toAccount(archivedAccount);
};

export const accountService = {
  listAccounts,
  createAccount,
  updateAccount,
  archiveAccount
};
