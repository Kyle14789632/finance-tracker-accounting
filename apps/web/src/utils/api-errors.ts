import type { FieldValues, Path, UseFormSetError } from "react-hook-form";
import { ApiError } from "./api-client";

type ValidationIssue = {
  path: string;
  message: string;
};

const isValidationIssue = (value: unknown): value is ValidationIssue =>
  typeof value === "object" &&
  value !== null &&
  typeof (value as { path?: unknown }).path === "string" &&
  typeof (value as { message?: unknown }).message === "string";

export const getApiErrorMessage = (error: unknown, fallbackMessage: string): string => {
  if (error instanceof ApiError && error.message) {
    return error.message;
  }

  return fallbackMessage;
};

export const applyApiFormErrors = <TFieldValues extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<TFieldValues>,
): string => {
  if (!(error instanceof ApiError)) {
    return "Unexpected error. Please try again.";
  }

  if (error.code === "VALIDATION_ERROR" && Array.isArray(error.details)) {
    for (const detail of error.details) {
      if (!isValidationIssue(detail) || !detail.path) {
        continue;
      }

      setError(detail.path as Path<TFieldValues>, {
        type: "server",
        message: detail.message,
      });
    }

    return "Please fix the highlighted fields.";
  }

  return error.message;
};
