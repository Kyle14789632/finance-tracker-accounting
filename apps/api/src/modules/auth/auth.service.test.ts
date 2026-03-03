import assert from "node:assert/strict";
import bcrypt from "bcrypt";
import type { User } from "../../../prisma/generated/client";
import { AppError } from "../../core/errors/app-error";
import { runSuite } from "../../test/unit-test-utils";
import { createAuthService } from "./auth.service";
import type { AuthRepository } from "./auth.repository";

const makeUser = (overrides?: Partial<User>): User => ({
  id: "33333333-3333-3333-3333-333333333333",
  email: "demo@flowledger.dev",
  passwordHash: "hashed-password",
  name: "Demo",
  currency: "PHP",
  learningModeEnabled: false,
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  ...overrides,
});

export const runAuthServiceTests = async (): Promise<number> => {
  return runSuite("auth.service", [
    {
      name: "register rejects duplicate email",
      run: async () => {
        const repository: AuthRepository = {
          findByEmail: async () => makeUser(),
          findById: async () => makeUser(),
          createUser: async () => makeUser(),
          updateUserSettings: async () => makeUser(),
        };

        const service = createAuthService({ repository });

        await assert.rejects(
          () =>
            service.register({
              email: "Demo@FlowLedger.dev",
              password: "DemoPass123!",
            }),
          (error: unknown) => {
            assert.ok(error instanceof AppError);
            assert.equal(error.code, "EMAIL_ALREADY_EXISTS");
            assert.equal(error.statusCode, 409);
            return true;
          },
        );
      },
    },
    {
      name: "login rejects invalid password",
      run: async () => {
        const passwordHash = await bcrypt.hash("CorrectPass123!", 4);
        const repository: AuthRepository = {
          findByEmail: async () => makeUser({ passwordHash }),
          findById: async () => makeUser(),
          createUser: async () => makeUser(),
          updateUserSettings: async () => makeUser(),
        };

        const service = createAuthService({ repository });

        await assert.rejects(
          () =>
            service.login({
              email: "demo@flowledger.dev",
              password: "WrongPass123!",
            }),
          (error: unknown) => {
            assert.ok(error instanceof AppError);
            assert.equal(error.code, "INVALID_CREDENTIALS");
            assert.equal(error.statusCode, 401);
            return true;
          },
        );
      },
    },
    {
      name: "update settings applies partial payload",
      run: async () => {
        let capturedName: string | undefined;
        const repository: AuthRepository = {
          findByEmail: async () => null,
          findById: async () => makeUser(),
          createUser: async () => makeUser(),
          updateUserSettings: async (_userId, payload) => {
            capturedName = payload.name;
            return makeUser({
              name: payload.name ?? "Demo",
              learningModeEnabled: payload.learningModeEnabled ?? false,
            });
          },
        };

        const service = createAuthService({ repository });
        const updatedUser = await service.updateAuthenticatedUserSettings(
          "33333333-3333-3333-3333-333333333333",
          {
            name: "Renamed Demo",
          },
        );

        assert.equal(capturedName, "Renamed Demo");
        assert.equal(updatedUser.name, "Renamed Demo");
      },
    },
  ]);
};
