import { config as loadEnv } from "dotenv";
import ms from "ms";
import { z } from "zod";

loadEnv();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  API_PORT: z
    .preprocess(
      (value) => Number(value ?? process.env.PORT ?? 4000),
      z.number().int().positive()
    )
    .default(4000),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  CORS_ORIGIN: z.string().min(1).default("http://localhost:5173"),
  JWT_ACCESS_SECRET: z.string().min(1, "JWT_ACCESS_SECRET is required"),
  JWT_REFRESH_SECRET: z.string().min(1, "JWT_REFRESH_SECRET is required"),
  JWT_ACCESS_EXPIRES_IN: z.string().min(1).default("15m"),
  JWT_REFRESH_EXPIRES_IN: z.string().min(1).default("7d")
});

const parsedEnv = envSchema.parse(process.env);

const refreshTokenMaxAge = ms(parsedEnv.JWT_REFRESH_EXPIRES_IN);

if (typeof refreshTokenMaxAge !== "number") {
  throw new Error("JWT_REFRESH_EXPIRES_IN must be a valid duration, for example 7d");
}

const parseCorsOrigins = (configuredOrigins: string): string[] => {
  const origins = configuredOrigins
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (origins.length === 0) {
    throw new Error("CORS_ORIGIN must include at least one allowed origin");
  }

  const normalizedOrigins = new Set<string>();

  for (const origin of origins) {
    if (origin === "*") {
      throw new Error("CORS_ORIGIN cannot use wildcard (*) in this app");
    }

    let parsedOriginUrl: URL;
    try {
      parsedOriginUrl = new URL(origin);
    } catch {
      throw new Error(`CORS_ORIGIN entry is not a valid URL: ${origin}`);
    }

    if (!["http:", "https:"].includes(parsedOriginUrl.protocol)) {
      throw new Error(`CORS_ORIGIN entry must use http/https: ${origin}`);
    }

    // Normalize entries to origin-only form so copied values like
    // https://example.com/ or https://example.com/path still match browser Origin.
    normalizedOrigins.add(parsedOriginUrl.origin);
  }

  return Array.from(normalizedOrigins);
};

const corsOrigins = parseCorsOrigins(parsedEnv.CORS_ORIGIN);

export const env = {
  nodeEnv: parsedEnv.NODE_ENV,
  apiPort: parsedEnv.API_PORT,
  databaseUrl: parsedEnv.DATABASE_URL,
  corsOrigins,
  jwtAccessSecret: parsedEnv.JWT_ACCESS_SECRET,
  jwtRefreshSecret: parsedEnv.JWT_REFRESH_SECRET,
  jwtAccessExpiresIn: parsedEnv.JWT_ACCESS_EXPIRES_IN,
  jwtRefreshExpiresIn: parsedEnv.JWT_REFRESH_EXPIRES_IN,
  jwtRefreshExpiresInMs: refreshTokenMaxAge
};
