import type { StyleSheet } from "./styles/style-sheet.type";

export const createStyles = <T extends StyleSheet>(properties: T): T => properties;
