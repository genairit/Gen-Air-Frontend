import merge from "lodash.merge";

export const isObject = (value: any): value is object => {
  return value && typeof value === "object" && !Array.isArray(value);
};

export const safeAssign = <T extends object>(
  original: T,
  props: Partial<T>
) => {
  return merge({}, original, props);
};