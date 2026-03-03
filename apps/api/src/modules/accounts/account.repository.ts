import type {
  Account as AccountRecord,
  AccountType as PrismaAccountType,
} from "../../../prisma/generated/client";
import type { CreateAccountRequest, ListAccountsQuery, UpdateAccountRequest } from "@sft/shared";
import { prisma } from "../../core/db/prisma";

export type AccountRepository = {
  listActiveByUser: (userId: string, query: ListAccountsQuery) => Promise<AccountRecord[]>;
  findActiveById: (userId: string, accountId: string) => Promise<AccountRecord | null>;
  create: (userId: string, payload: CreateAccountRequest) => Promise<AccountRecord>;
  update: (accountId: string, payload: UpdateAccountRequest) => Promise<AccountRecord>;
  archive: (accountId: string) => Promise<AccountRecord>;
};

export const createAccountRepository = (): AccountRepository => ({
  listActiveByUser: (userId, query) =>
    prisma.account.findMany({
      where: {
        userId,
        isArchived: false,
        type: query.type as PrismaAccountType | undefined,
      },
      orderBy: [{ name: "asc" }, { createdAt: "asc" }],
    }),

  findActiveById: (userId, accountId) =>
    prisma.account.findFirst({
      where: {
        id: accountId,
        userId,
        isArchived: false,
      },
    }),

  create: (userId, payload) =>
    prisma.account.create({
      data: {
        userId,
        name: payload.name,
        type: payload.type as PrismaAccountType,
      },
    }),

  update: (accountId, payload) =>
    prisma.account.update({
      where: { id: accountId },
      data: {
        name: payload.name,
        type: payload.type as PrismaAccountType,
      },
    }),

  archive: (accountId) =>
    prisma.account.update({
      where: { id: accountId },
      data: {
        isArchived: true,
      },
    }),
});
