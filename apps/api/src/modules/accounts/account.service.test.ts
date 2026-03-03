import assert from "node:assert/strict";
import type { Account } from "../../../prisma/generated/client";
import { AppError } from "../../core/errors/app-error";
import { runSuite } from "../../test/unit-test-utils";
import { createAccountService } from "./account.service";
import type { AccountRepository } from "./account.repository";

const makeAccount = (overrides?: Partial<Account>): Account => ({
  id: "22222222-2222-2222-2222-222222222222",
  userId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
  name: "Wallet",
  type: "CASH",
  isArchived: false,
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  ...overrides,
});

export const runAccountServiceTests = async (): Promise<number> => {
  return runSuite("accounts.service", [
    {
      name: "creates account with mapped response",
      run: async () => {
        const repository: AccountRepository = {
          listActiveByUser: async () => [makeAccount()],
          findActiveById: async () => makeAccount(),
          create: async () => makeAccount(),
          update: async () => makeAccount({ name: "Savings" }),
          archive: async () => makeAccount({ isArchived: true }),
        };

        const service = createAccountService({ repository });
        const account = await service.createAccount("user-id", {
          name: "Wallet",
          type: "CASH",
        });

        assert.equal(account.name, "Wallet");
        assert.equal(account.type, "CASH");
        assert.equal(account.createdAt, "2026-01-01T00:00:00.000Z");
      },
    },
    {
      name: "archive throws ACCOUNT_NOT_FOUND when account is missing",
      run: async () => {
        const repository: AccountRepository = {
          listActiveByUser: async () => [],
          findActiveById: async () => null,
          create: async () => makeAccount(),
          update: async () => makeAccount(),
          archive: async () => makeAccount({ isArchived: true }),
        };

        const service = createAccountService({ repository });

        await assert.rejects(
          () => service.archiveAccount("user-id", "missing-account-id"),
          (error: unknown) => {
            assert.ok(error instanceof AppError);
            assert.equal(error.code, "ACCOUNT_NOT_FOUND");
            assert.equal(error.statusCode, 404);
            return true;
          },
        );
      },
    },
  ]);
};
