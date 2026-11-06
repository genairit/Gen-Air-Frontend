import {
  type SurfaceDepthType,
  type SurfaceRadiusType,
  SHADOW_BY_SURFACE_DEPTH,
} from "../../constants/surface.constant";

import { createStyles } from "../../create-styles";
import { theme } from "../../constants/theme.constants";

interface ICardStyleOptions {
  gap: string;
  padding: string;
  isClickable: boolean;
  depth: SurfaceDepthType;
  radius: SurfaceRadiusType;
}

const CARD_MOTION = {
  transition: "transform 280ms cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 220ms ease",
  "@media (hover: hover)": {
    "&:hover": { transform: "translateY(-2px) scale(1.005)" },
  },
  "@media (prefers-reduced-motion: reduce)": {
    transition: "none",
    "&:hover": { transform: "none" },
  },
} as const;

export const useStyles = () =>
  createStyles({
    card: ({ depth, radius, padding, gap, isClickable }: ICardStyleOptions) => ({
      gap,
      padding,
      display: "flex",
      position: "relative",
      flexDirection: "column",
      borderRadius: theme.radius[radius],
      cursor: isClickable ? "pointer" : "default",
      border: `1px solid ${theme.glass.rim}`,
      backgroundColor: theme.glass.strong,
      boxShadow: SHADOW_BY_SURFACE_DEPTH[depth],
      "&:focus-within": {
        zIndex: 1,
        ...(isClickable && {
          outline: `2px solid ${theme.palette.primary}`,
          outlineOffset: 2,
        }),
      },
      ...(isClickable ? CARD_MOTION : {}),
    }),
    actionButton: {
      inset: 0,
      width: "100%",
      height: "100%",
      opacity: 0,
      border: 0,
      padding: 0,
      position: "absolute",
      pointerEvents: "none",
    },
  });
