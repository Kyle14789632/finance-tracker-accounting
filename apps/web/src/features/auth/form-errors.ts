import type { FieldValues, UseFormSetError } from "react-hook-form";
import { applyApiFormErrors } from "../../utils/api-errors";

export const applyServerFormErrors = <TFieldValues extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<TFieldValues>
): string => applyApiFormErrors(error, setError);
