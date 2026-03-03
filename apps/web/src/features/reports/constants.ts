export const currentMonth = new Date().toISOString().slice(0, 7);

export const chartPalette = ["#4b86c0", "#7ba989", "#94a3b8", "#93c5fd", "#86efac", "#c4b5fd"];

export type ExpenseChartDatum = {
  id: string;
  name: string;
  shortName: string;
  value: number;
  fill: string;
};

export const toShortLabel = (value: string): string => {
  if (value.length <= 16) {
    return value;
  }

  return `${value.slice(0, 13)}...`;
};
