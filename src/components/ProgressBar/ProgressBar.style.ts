import { createStyles } from "../../create-styles";
import { theme } from "../../constants/theme.constants";
import type { ControlSizeType } from "../../constants/selection-control.constant";

const { palette, softShadow, radius } = theme;

const TRACK_BY_SIZE: Record<
  ControlSizeType,
  { height: number; padding: string; boxShadow: string }
> = {
  small: { height: 8, padding: "2px", boxShadow: softShadow.insetSmall },
  medium: { height: 14, padding: "3px", boxShadow: softShadow.inset },
};

const FILL_SHADOW_BY_SIZE: Record<ControlSizeType, string> = {
  small: "none",
  medium: softShadow.progressFill,
};

export const useStyles = () =>
  createStyles({
    container: {
      gap: "10px",
      width: "100%",
      display: "flex",
      flexDirection: "column",
    },
    header: {
      fontSize: 13,
      display: "flex",
      justifyContent: "space-between",
    },
    title: {
      fontWeight: 600,
    },
    caption: {
      color: palette.textMuted,
    },
    track: ({ size }: { size: ControlSizeType }) => ({
      borderRadius: radius.pill,
      backgroundColor: palette.iceWhite,
      ...TRACK_BY_SIZE[size],
    }),
    fill: ({ size, percentage }: { size: ControlSizeType; percentage: number }) => ({
      height: "100%",
      width: `${percentage}%`,
      borderRadius: radius.pill,
      transition: "width 0.3s ease",
      boxShadow: FILL_SHADOW_BY_SIZE[size],
      backgroundColor: palette.airBlueStrong,
    }),
  });
