import { Prisma } from "../../../prisma/generated/client";

export const asDecimal = (value: Prisma.Decimal | null | undefined): Prisma.Decimal => {
  return value ?? new Prisma.Decimal(0);
};

export const toMoneyString = (value: Prisma.Decimal): string => value.toFixed(2);

export const sumMoneyStrings = (values: string[]): Prisma.Decimal => {
  return values.reduce((runningTotal, value) => runningTotal.plus(value), new Prisma.Decimal(0));
};
