import {
  FULLY_ROUNDED_RADIUS,
  PROGRESS_BAR_DIMENSIONS,
  type ProgressBarSizeType,
  PROGRESS_BAR_FILL_TRANSITION,
} from "./constants/progress-bar.constant";

import { theme } from "../../theme";
import type { CSSProperties } from "react";
import { createStyles } from "../../create-styles";

export const useStyles = () =>
  createStyles({
    root: (size: ProgressBarSizeType): CSSProperties => ({
      display: "flex",
      alignItems: "center",
      flexDirection: "row-reverse",
      gap: PROGRESS_BAR_DIMENSIONS[size].gap,
    }),
    fraction: (size: ProgressBarSizeType): CSSProperties => ({
      flex: "0 0 auto",
      color: theme.text.primary,
      fontVariantNumeric: "tabular-nums",
      fontSize: PROGRESS_BAR_DIMENSIONS[size].fontSize,
    }),
    track: (size: ProgressBarSizeType): CSSProperties => ({
      flex: 1,
      overflow: "hidden",
      borderRadius: FULLY_ROUNDED_RADIUS,
      background: theme.background.progressTrack,
      height: PROGRESS_BAR_DIMENSIONS[size].trackHeight,
    }),
    fill: (percentage: number, reducedMotion: boolean): CSSProperties => ({
      height: "100%",
      width: `${percentage}%`,
      borderRadius: FULLY_ROUNDED_RADIUS,
      transition: reducedMotion ? "none" : PROGRESS_BAR_FILL_TRANSITION,
      background: theme.background.progressFill,
    }),
  });
