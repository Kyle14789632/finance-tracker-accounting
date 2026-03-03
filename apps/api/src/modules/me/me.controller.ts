import { updateMeSettingsRequestSchema } from "@sft/shared";
import { getRequestContext } from "../../core/http/auth-context";
import { asyncHandler } from "../../core/http/async-handler";
import { meService } from "./me.service";

export const getMeController = asyncHandler(async (_req, res) => {
  const context = getRequestContext(res);
  const user = await meService.getMe(context.userId);
  res.status(200).json({ user });
});

export const updateMeSettingsController = asyncHandler(async (req, res) => {
  const payload = updateMeSettingsRequestSchema.parse(req.body);
  const context = getRequestContext(res);
  const user = await meService.updateMeSettings(context.userId, payload);
  res.status(200).json({ user });
});
