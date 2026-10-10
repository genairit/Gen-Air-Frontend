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

export const useStyles = () =>
  createStyles({
    card: ({ depth, radius, padding, gap, isClickable }: ICardStyleOptions) => ({
      gap,
      padding,
      display: "flex",
      flexDirection: "column",
      borderRadius: theme.radius[radius],
      cursor: isClickable ? "pointer" : "default",
      backgroundColor: theme.palette.iceWhite,
      boxShadow: SHADOW_BY_SURFACE_DEPTH[depth],
      transition: "box-shadow 0.2s ease, background-color 0.2s ease",
    }),
  });
