import cookieParser from "cookie-parser";
import cors, { type CorsOptions } from "cors";
import express from "express";
import helmet from "helmet";
import { env } from "./config/env";
import { errorHandler, notFoundHandler } from "./middleware/error-handler";
import apiRouter from "./routes";
import { httpLogger } from "./utils/logger";

const getAllowedOrigins = (): string[] => {
  return env.corsOrigins;
};

const buildCorsOptions = (): CorsOptions => {
  const allowedOrigins = getAllowedOrigins();

  return {
    credentials: true,
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      const corsError = new Error("CORS origin not allowed") as Error & {
        statusCode: number;
        code: string;
      };
      corsError.statusCode = 403;
      corsError.code = "CORS_ORIGIN_NOT_ALLOWED";
      callback(corsError);
    }
  };
};

export const createServer = (): express.Express => {
  const app = express();

  app.use(httpLogger);
  app.use(helmet());
  app.use(cors(buildCorsOptions()));
  app.use(cookieParser());
  app.use(express.json());

  app.use("/", apiRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
