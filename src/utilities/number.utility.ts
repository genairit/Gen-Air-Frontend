export const clampPercentage = (value: number) => Math.min(100, Math.max(0, value));

export const createOneBasedRange = (count: number) =>
  Array.from({ length: count }, (_, index) => index + 1);

export const toTwoDigitOrdinal = (position: number) => String(position).padStart(2, "0");
