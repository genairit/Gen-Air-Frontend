import merge from "lodash.merge";

export const isObject = (value: unknown): value is object => {
  return value !== null && typeof value === "object" && !Array.isArray(value);
};

export const safeAssign = <T>(original: T & object, props: Partial<T>) =>
  merge({}, original, props);
