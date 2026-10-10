import type { StyleSheet } from "./style-sheet.type";

export function createStyles<T extends StyleSheet>(properties: T): T {
  return properties;
}