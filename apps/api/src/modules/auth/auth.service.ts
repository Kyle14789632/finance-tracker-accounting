import type {
  LoginRequest,
  PublicUser,
  RegisterRequest,
  UpdateMeSettingsRequest,
} from "@sft/shared";
import bcrypt from "bcrypt";
import { AppError } from "../../core/errors/app-error";
import { toPublicUser } from "./auth.mapper";
import { createAuthRepository, type AuthRepository } from "./auth.repository";
import { issueAccessToken, issueRefreshToken } from "./auth-token";

const SALT_ROUNDS = 12;

const normalizeEmail = (email: string): string => email.trim().toLowerCase();

type AuthResult = {
  user: PublicUser;
  accessToken: string;
  refreshToken: string;
};

export type AuthService = {
  register: (payload: RegisterRequest) => Promise<AuthResult>;
  login: (payload: LoginRequest) => Promise<AuthResult>;
  getAuthenticatedUser: (userId: string) => Promise<PublicUser>;
  updateAuthenticatedUserSettings: (
    userId: string,
    payload: UpdateMeSettingsRequest,
  ) => Promise<PublicUser>;
};

type AuthServiceDeps = {
  repository: AuthRepository;
};

const buildAuthResult = (user: PublicUser): AuthResult => ({
  user,
  accessToken: issueAccessToken(user.id, user.email),
  refreshToken: issueRefreshToken(user.id, user.email),
});

export const createAuthService = ({ repository }: AuthServiceDeps): AuthService => ({
  register: async (payload) => {
    const email = normalizeEmail(payload.email);
    const existingUser = await repository.findByEmail(email);

    if (existingUser) {
      throw new AppError(409, "EMAIL_ALREADY_EXISTS", "An account with this email already exists");
    }

    const passwordHash = await bcrypt.hash(payload.password, SALT_ROUNDS);
    const user = await repository.createUser({ ...payload, email, passwordHash });
    return buildAuthResult(toPublicUser(user));
  },

  login: async (payload) => {
    const email = normalizeEmail(payload.email);
    const user = await repository.findByEmail(email);

    if (!user) {
      throw new AppError(401, "INVALID_CREDENTIALS", "Invalid email or password");
    }

    const passwordMatches = await bcrypt.compare(payload.password, user.passwordHash);

    if (!passwordMatches) {
      throw new AppError(401, "INVALID_CREDENTIALS", "Invalid email or password");
    }

    return buildAuthResult(toPublicUser(user));
  },

  getAuthenticatedUser: async (userId) => {
    const user = await repository.findById(userId);

    if (!user) {
      throw new AppError(404, "USER_NOT_FOUND", "User not found");
    }

    return toPublicUser(user);
  },

  updateAuthenticatedUserSettings: async (userId, payload) => {
    const existingUser = await repository.findById(userId);

    if (!existingUser) {
      throw new AppError(404, "USER_NOT_FOUND", "User not found");
    }

    const updatedUser = await repository.updateUserSettings(userId, payload);
    return toPublicUser(updatedUser);
  },
});

export const authService = createAuthService({
  repository: createAuthRepository(),
});
