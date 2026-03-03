import type { CookieOptions } from "express";
import jwt from "jsonwebtoken";
import { env } from "../../config/env";
import { AppError } from "../../core/errors/app-error";

export const REFRESH_TOKEN_COOKIE_NAME = "refreshToken";

type TokenType = "access" | "refresh";

type TokenPayload = {
  sub: string;
  email: string;
  tokenType: TokenType;
};

export type AccessTokenPayload = TokenPayload & {
  tokenType: "access";
};

export const issueAccessToken = (userId: string, email: string): string =>
  jwt.sign(
    {
      sub: userId,
      email,
      tokenType: "access",
    } satisfies TokenPayload,
    env.jwtAccessSecret,
    { expiresIn: env.jwtAccessExpiresIn },
  );

export const issueRefreshToken = (userId: string, email: string): string =>
  jwt.sign(
    {
      sub: userId,
      email,
      tokenType: "refresh",
    } satisfies TokenPayload,
    env.jwtRefreshSecret,
    { expiresIn: env.jwtRefreshExpiresIn },
  );

export const verifyAccessToken = (token: string): AccessTokenPayload => {
  const payload = jwt.verify(token, env.jwtAccessSecret);

  if (
    typeof payload !== "object" ||
    payload.tokenType !== "access" ||
    !payload.sub ||
    !payload.email
  ) {
    throw new AppError(401, "INVALID_ACCESS_TOKEN", "Access token is invalid");
  }

  return payload as AccessTokenPayload;
};

export const getRefreshCookieOptions = (): CookieOptions => ({
  httpOnly: true,
  secure: env.nodeEnv === "production",
  sameSite: "lax",
  path: "/",
  maxAge: env.jwtRefreshExpiresInMs,
});
