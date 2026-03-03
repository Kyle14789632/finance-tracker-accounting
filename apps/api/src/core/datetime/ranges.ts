import { AppError } from "../errors/app-error";

export const getMonthRangeUtc = (month: string): { start: Date; end: Date } => {
  const [yearPart, monthPart] = month.split("-");
  const year = Number(yearPart);
  const monthNumber = Number(monthPart);

  return {
    start: new Date(Date.UTC(year, monthNumber - 1, 1, 0, 0, 0, 0)),
    end: new Date(Date.UTC(year, monthNumber, 1, 0, 0, 0, 0)),
  };
};

export const getAsOfEndExclusiveUtc = (asOf: string): Date => {
  const [yearPart, monthPart, dayPart] = asOf.split("-");
  const year = Number(yearPart);
  const month = Number(monthPart);
  const day = Number(dayPart);

  return new Date(Date.UTC(year, month - 1, day + 1, 0, 0, 0, 0));
};

export const parseOccurredAt = (occurredAt: string): Date => {
  const parsedDate = new Date(occurredAt);

  if (Number.isNaN(parsedDate.getTime())) {
    throw new AppError(400, "INVALID_OCCURRED_AT", "Occurred at must be a valid datetime");
  }

  return parsedDate;
};
