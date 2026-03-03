import type {
  Account,
  CreateAccountRequest,
  ListAccountsQuery,
  UpdateAccountRequest,
} from "@sft/shared";
import { AppError } from "../../core/errors/app-error";
import { toAccount } from "./account.mapper";
import { createAccountRepository, type AccountRepository } from "./account.repository";

export type AccountService = {
  listAccounts: (userId: string, query: ListAccountsQuery) => Promise<Account[]>;
  createAccount: (userId: string, payload: CreateAccountRequest) => Promise<Account>;
  updateAccount: (
    userId: string,
    accountId: string,
    payload: UpdateAccountRequest,
  ) => Promise<Account>;
  archiveAccount: (userId: string, accountId: string) => Promise<Account>;
};

type AccountServiceDeps = {
  repository: AccountRepository;
};

const ensureActiveAccount = async (
  repository: AccountRepository,
  userId: string,
  accountId: string,
): Promise<void> => {
  const account = await repository.findActiveById(userId, accountId);

  if (!account) {
    throw new AppError(404, "ACCOUNT_NOT_FOUND", "Account not found");
  }
};

export const createAccountService = ({ repository }: AccountServiceDeps): AccountService => ({
  listAccounts: async (userId, query) => {
    const accounts = await repository.listActiveByUser(userId, query);
    return accounts.map(toAccount);
  },

  createAccount: async (userId, payload) => {
    const account = await repository.create(userId, payload);
    return toAccount(account);
  },

  updateAccount: async (userId, accountId, payload) => {
    await ensureActiveAccount(repository, userId, accountId);
    const updatedAccount = await repository.update(accountId, payload);
    return toAccount(updatedAccount);
  },

  archiveAccount: async (userId, accountId) => {
    await ensureActiveAccount(repository, userId, accountId);
    const archivedAccount = await repository.archive(accountId);
    return toAccount(archivedAccount);
  },
});

export const accountService = createAccountService({
  repository: createAccountRepository(),
});
