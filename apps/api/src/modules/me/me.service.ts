import type { PublicUser, UpdateMeSettingsRequest } from "@sft/shared";
import { authService, type AuthService } from "../auth";

export type MeService = {
  getMe: (userId: string) => Promise<PublicUser>;
  updateMeSettings: (userId: string, payload: UpdateMeSettingsRequest) => Promise<PublicUser>;
};

type MeServiceDeps = {
  auth: AuthService;
};

export const createMeService = ({ auth }: MeServiceDeps): MeService => ({
  getMe: (userId) => auth.getAuthenticatedUser(userId),
  updateMeSettings: (userId, payload) => auth.updateAuthenticatedUserSettings(userId, payload),
});

export const meService = createMeService({
  auth: authService,
});
