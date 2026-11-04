import type { CSSProperties } from "react";
import type { SxProps, Theme } from "@mui/material";

export type StyleProps = CSSProperties | SxProps<Theme>;

export type StyleSheetGenrator = (...props: never[]) => StyleProps;

export type StyleSheet = {
  [key: string]: StyleProps | StyleSheetGenrator;
};
