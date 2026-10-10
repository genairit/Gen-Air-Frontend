import type { CSSProperties } from "react";
import type { SxProps } from "@mui/material";

export type StyleProps = CSSProperties | SxProps<any>;

export type StyleSheetGenrator = (props: Record<string, any>) => StyleProps;

export type StyleSheet = {
  [key: string]: StyleProps | StyleSheetGenrator;
};