import type { StyleProps, StyleSheet } from "./styles/style-sheet.type";

export function createStyles<T extends StyleSheet>(properties: T): T {
  return properties;
}

export const combineStyles = (...sheets: Array<StyleProps>): StyleProps => {
  const result: StyleSheet = {};

  sheets.forEach((sheet) => {
    Object.assign(result, sheet);
  });

  return result;
};
