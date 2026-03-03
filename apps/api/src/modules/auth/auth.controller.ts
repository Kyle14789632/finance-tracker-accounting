import type { RequestHandler } from "express";
import { loginRequestSchema, registerRequestSchema } from "@sft/shared";
import { asyncHandler } from "../../core/http/async-handler";
import { authService } from "./auth.service";
import { getRefreshCookieOptions, REFRESH_TOKEN_COOKIE_NAME } from "./auth-token";

export const registerController: RequestHandler = asyncHandler(async (req, res) => {
  const payload = registerRequestSchema.parse(req.body);
  const result = await authService.register(payload);

  res.cookie(REFRESH_TOKEN_COOKIE_NAME, result.refreshToken, getRefreshCookieOptions());
  res.status(201).json({
    user: result.user,
    accessToken: result.accessToken,
  });
});

export const loginController: RequestHandler = asyncHandler(async (req, res) => {
  const payload = loginRequestSchema.parse(req.body);
  const result = await authService.login(payload);

  res.cookie(REFRESH_TOKEN_COOKIE_NAME, result.refreshToken, getRefreshCookieOptions());
  res.status(200).json({
    user: result.user,
    accessToken: result.accessToken,
  });
});

export const logoutController: RequestHandler = asyncHandler(async (_req, res) => {
  const clearCookieOptions = getRefreshCookieOptions();
  delete clearCookieOptions.maxAge;
  res.clearCookie(REFRESH_TOKEN_COOKIE_NAME, clearCookieOptions);
  res.status(200).json({ success: true });
});
