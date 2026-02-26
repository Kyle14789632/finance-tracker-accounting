const centsInUnit = 100n;

export const moneyStringToCents = (value: string): bigint => {
  const normalized = value.trim();
  const isNegative = normalized.startsWith("-");
  const unsigned = isNegative ? normalized.slice(1) : normalized;
  const [wholePartRaw, decimalPartRaw = ""] = unsigned.split(".");
  const wholePart = wholePartRaw || "0";
  const decimalPart = (decimalPartRaw + "00").slice(0, 2);
  const cents = BigInt(wholePart) * centsInUnit + BigInt(decimalPart);

  return isNegative ? -cents : cents;
};

export const centsToDisplayNumber = (value: bigint): number => Number(value) / Number(centsInUnit);

export const formatMoneyString = (formatter: Intl.NumberFormat, value: string): string =>
  formatter.format(centsToDisplayNumber(moneyStringToCents(value)));

export const formatMoneyCents = (formatter: Intl.NumberFormat, value: bigint): string =>
  formatter.format(centsToDisplayNumber(value));
