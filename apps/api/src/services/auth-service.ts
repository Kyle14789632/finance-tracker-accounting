import type { User } from "../../prisma/generated/client";
import type {
  LoginRequest,
  PublicUser,
  RegisterRequest,
  UpdateMeSettingsRequest
} from "@sft/shared";
import bcrypt from "bcrypt";
import { AppError } from "../utils/app-error";
import { issueAccessToken, issueRefreshToken } from "../utils/auth";
import { prisma } from "../utils/prisma";

const SALT_ROUNDS = 12;

const normalizeEmail = (email: string): string => email.trim().toLowerCase();

const toSupportedCurrency = (currency: string): PublicUser["currency"] =>
  currency === "USD" ? "USD" : "PHP";

const toPublicUser = (user: User): PublicUser => ({
  id: user.id,
  email: user.email,
  name: user.name,
  currency: toSupportedCurrency(user.currency),
  learningModeEnabled: user.learningModeEnabled,
  createdAt: user.createdAt.toISOString(),
  updatedAt: user.updatedAt.toISOString()
});

type AuthResult = {
  user: PublicUser;
  accessToken: string;
  refreshToken: string;
};

const buildAuthResult = (user: User): AuthResult => ({
  user: toPublicUser(user),
  accessToken: issueAccessToken(user.id, user.email),
  refreshToken: issueRefreshToken(user.id, user.email)
});

const register = async (payload: RegisterRequest): Promise<AuthResult> => {
  const email = normalizeEmail(payload.email);

  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (existingUser) {
    throw new AppError(409, "EMAIL_ALREADY_EXISTS", "An account with this email already exists");
  }

  const passwordHash = await bcrypt.hash(payload.password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      name: payload.name ?? null,
      currency: payload.currency ?? "PHP"
    }
  });

  return buildAuthResult(user);
};

const login = async (payload: LoginRequest): Promise<AuthResult> => {
  const email = normalizeEmail(payload.email);

  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    throw new AppError(401, "INVALID_CREDENTIALS", "Invalid email or password");
  }

  const passwordMatches = await bcrypt.compare(payload.password, user.passwordHash);

  if (!passwordMatches) {
    throw new AppError(401, "INVALID_CREDENTIALS", "Invalid email or password");
  }

  return buildAuthResult(user);
};

const getAuthenticatedUser = async (userId: string): Promise<PublicUser> => {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    throw new AppError(404, "USER_NOT_FOUND", "User not found");
  }

  return toPublicUser(user);
};

const updateAuthenticatedUserSettings = async (
  userId: string,
  payload: UpdateMeSettingsRequest
): Promise<PublicUser> => {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    throw new AppError(404, "USER_NOT_FOUND", "User not found");
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(payload.learningModeEnabled !== undefined
        ? { learningModeEnabled: payload.learningModeEnabled }
        : {}),
      ...(payload.name !== undefined ? { name: payload.name } : {})
    }
  });

  return toPublicUser(updatedUser);
};

export const authService = {
  register,
  login,
  getAuthenticatedUser,
  updateAuthenticatedUserSettings
};
