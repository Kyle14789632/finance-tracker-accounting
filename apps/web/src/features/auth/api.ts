import type {
  AuthSuccessResponse,
  LoginRequest,
  MeResponse,
  RegisterRequest,
  UpdateMeSettingsRequest,
  UpdateMeSettingsResponse
} from "@sft/shared";
import { apiRequest } from "../../utils/api-client";
import {
  authSuccessResponseSchema,
  loginRequestSchema,
  meResponseSchema,
  updateMeSettingsRequestSchema,
  updateMeSettingsResponseSchema,
  registerRequestSchema
} from "./schemas";

export const register = async (payload: RegisterRequest): Promise<AuthSuccessResponse> => {
  const parsedPayload = registerRequestSchema.parse(payload);
  const response = await apiRequest<unknown>("/auth/register", {
    method: "POST",
    body: parsedPayload
  });

  return authSuccessResponseSchema.parse(response);
};

export const login = async (payload: LoginRequest): Promise<AuthSuccessResponse> => {
  const parsedPayload = loginRequestSchema.parse(payload);
  const response = await apiRequest<unknown>("/auth/login", {
    method: "POST",
    body: parsedPayload
  });

  return authSuccessResponseSchema.parse(response);
};

export const logout = async (accessToken: string): Promise<void> => {
  await apiRequest<{ success: boolean }>("/auth/logout", {
    method: "POST",
    accessToken
  });
};

export const getMe = async (accessToken: string): Promise<MeResponse> => {
  const response = await apiRequest<unknown>("/me", {
    accessToken
  });

  return meResponseSchema.parse(response);
};

export const updateMeSettings = async (
  accessToken: string,
  payload: UpdateMeSettingsRequest
): Promise<UpdateMeSettingsResponse> => {
  const parsedPayload = updateMeSettingsRequestSchema.parse(payload);
  const response = await apiRequest<unknown>("/me/settings", {
    method: "PATCH",
    accessToken,
    body: parsedPayload
  });

  return updateMeSettingsResponseSchema.parse(response);
};
