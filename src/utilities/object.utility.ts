import merge from "lodash.merge";

export const isObject = (value: unknown): value is object => {
  return value !== null && typeof value === "object" && !Array.isArray(value);
};

export function safeAssign<T>(original: T & object, props: Partial<T>) {
  return merge({}, original, props);
}
