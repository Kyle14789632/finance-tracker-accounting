import type { ErrorRequestHandler, RequestHandler } from "express";
import { JsonWebTokenError, NotBeforeError, TokenExpiredError } from "jsonwebtoken";
import { ZodError } from "zod";
import { AppError } from "../utils/app-error";

type ApiErrorBody = {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
};

type RequestError = Error & {
  statusCode?: number;
  status?: number;
  code?: string;
  details?: unknown;
};

export const notFoundHandler: RequestHandler = (req, _res, next) => {
  next(new AppError(404, "NOT_FOUND", `Route not found: ${req.method} ${req.originalUrl}`));
};

export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  if (err instanceof ZodError) {
    res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Request validation failed",
        details: err.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message
        }))
      }
    });
    return;
  }

  if (err instanceof TokenExpiredError) {
    res.status(401).json({
      error: {
        code: "TOKEN_EXPIRED",
        message: "Access token has expired"
      }
    });
    return;
  }

  if (err instanceof JsonWebTokenError || err instanceof NotBeforeError) {
    res.status(401).json({
      error: {
        code: "INVALID_TOKEN",
        message: "Access token is invalid"
      }
    });
    return;
  }

  const appError = err as RequestError;
  const statusCode = appError.statusCode ?? appError.status ?? 500;
  const code = appError.code ?? "INTERNAL_SERVER_ERROR";
  const message = appError.message || "Unexpected error";
  const requestId = (req as { id?: string }).id;

  req.log?.error({ err: appError, statusCode, code, requestId }, "Request failed");

  const payload: ApiErrorBody = {
    error: {
      code,
      message
    }
  };

  if (appError.details !== undefined) {
    payload.error.details = appError.details;
  }

  if (statusCode >= 500) {
    payload.error.details = {
      ...(typeof payload.error.details === "object" && payload.error.details !== null
        ? (payload.error.details as Record<string, unknown>)
        : {}),
      requestId
    };
  }

  res.status(statusCode).json(payload);
};
