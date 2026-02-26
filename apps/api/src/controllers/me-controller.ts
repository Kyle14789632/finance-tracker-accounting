import type { RequestHandler } from "express";
import { updateMeSettingsRequestSchema } from "@sft/shared";
import type { AuthLocals } from "../middleware/require-auth";
import { authService } from "../services/auth-service";

export const getMeController: RequestHandler<unknown, unknown, unknown, unknown, AuthLocals> = async (
  _req,
  res,
  next
) => {
  try {
    const user = await authService.getAuthenticatedUser(res.locals.auth.userId);
    res.status(200).json({ user });
  } catch (error) {
    next(error);
  }
};

export const updateMeSettingsController: RequestHandler<
  unknown,
  unknown,
  unknown,
  unknown,
  AuthLocals
> = async (req, res, next) => {
  try {
    const payload = updateMeSettingsRequestSchema.parse(req.body);
    const user = await authService.updateAuthenticatedUserSettings(res.locals.auth.userId, payload);
    res.status(200).json({ user });
  } catch (error) {
    next(error);
  }
};
