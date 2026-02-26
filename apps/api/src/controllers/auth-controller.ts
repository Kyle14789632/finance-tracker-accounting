import type { RequestHandler } from "express";
import { loginRequestSchema, registerRequestSchema } from "@sft/shared";
import { authService } from "../services/auth-service";
import { getRefreshCookieOptions, REFRESH_TOKEN_COOKIE_NAME } from "../utils/auth";

export const registerController: RequestHandler = async (req, res, next) => {
  try {
    const payload = registerRequestSchema.parse(req.body);
    const result = await authService.register(payload);

    res.cookie(REFRESH_TOKEN_COOKIE_NAME, result.refreshToken, getRefreshCookieOptions());
    res.status(201).json({
      user: result.user,
      accessToken: result.accessToken
    });
  } catch (error) {
    next(error);
  }
};

export const loginController: RequestHandler = async (req, res, next) => {
  try {
    const payload = loginRequestSchema.parse(req.body);
    const result = await authService.login(payload);

    res.cookie(REFRESH_TOKEN_COOKIE_NAME, result.refreshToken, getRefreshCookieOptions());
    res.status(200).json({
      user: result.user,
      accessToken: result.accessToken
    });
  } catch (error) {
    next(error);
  }
};

export const logoutController: RequestHandler = (_req, res) => {
  const clearCookieOptions = getRefreshCookieOptions();
  delete clearCookieOptions.maxAge;
  res.clearCookie(REFRESH_TOKEN_COOKIE_NAME, clearCookieOptions);
  res.status(200).json({ success: true });
};
