import type { RequestHandler } from "express";
import { AppError } from "../core/errors/app-error";
import { verifyAccessToken } from "../modules/auth/auth-token";

export const requireAuth: RequestHandler = (req, res, next) => {
  const authorizationHeader = req.headers.authorization;

  if (!authorizationHeader) {
    next(new AppError(401, "AUTH_REQUIRED", "Authorization header is required"));
    return;
  }

  const [scheme, token] = authorizationHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    next(new AppError(401, "INVALID_AUTH_HEADER", "Authorization header must use Bearer token"));
    return;
  }

  try {
    const payload = verifyAccessToken(token);
    res.locals.auth = {
      userId: payload.sub,
      email: payload.email,
    };
    next();
  } catch (error) {
    next(error);
  }
};
