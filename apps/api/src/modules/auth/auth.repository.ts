import type { User } from "../../../prisma/generated/client";
import type { RegisterRequest, UpdateMeSettingsRequest } from "@sft/shared";
import { prisma } from "../../core/db/prisma";

export type AuthRepository = {
  findByEmail: (email: string) => Promise<User | null>;
  findById: (userId: string) => Promise<User | null>;
  createUser: (payload: RegisterRequest & { email: string; passwordHash: string }) => Promise<User>;
  updateUserSettings: (userId: string, payload: UpdateMeSettingsRequest) => Promise<User>;
};

export const createAuthRepository = (): AuthRepository => ({
  findByEmail: (email) =>
    prisma.user.findUnique({
      where: { email },
    }),

  findById: (userId) =>
    prisma.user.findUnique({
      where: { id: userId },
    }),

  createUser: ({ email, passwordHash, name, currency }) =>
    prisma.user.create({
      data: {
        email,
        passwordHash,
        name: name ?? null,
        currency: currency ?? "PHP",
      },
    }),

  updateUserSettings: (userId, payload) =>
    prisma.user.update({
      where: { id: userId },
      data: {
        ...(payload.learningModeEnabled !== undefined
          ? { learningModeEnabled: payload.learningModeEnabled }
          : {}),
        ...(payload.name !== undefined ? { name: payload.name } : {}),
      },
    }),
});
