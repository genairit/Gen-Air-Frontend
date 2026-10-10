export const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

export const isNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

export const isNullableString = (value: unknown): value is string | null =>
  value === null || typeof value === "string";

export const hasStringFields = (record: Record<string, unknown>, keys: readonly string[]) =>
  keys.every(key => typeof record[key] === "string");

export const isArrayOf =
  <TItem>(isItem: (value: unknown) => value is TItem) =>
  (value: unknown): value is TItem[] =>
    Array.isArray(value) && value.every(isItem);

export const isOptionalOf =
  <TItem>(isItem: (value: unknown) => value is TItem) =>
  (value: unknown): boolean =>
    value == null || isItem(value);
