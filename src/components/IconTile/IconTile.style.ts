import { createStyles } from "../../create-styles";
import { theme } from "../../constants/theme.constants";
import { CENTERED_FLEX } from "../../styles/templates.style";
import type { IconTileSizeType } from "../../constants/icon-tile.constant";
import { SHADOW_BY_SURFACE_DEPTH, type SurfaceDepthType } from "../../constants/surface.constant";

interface ITileDimensions {
  tile: number;
  icon: number;
  radius: string;
}

export const ICON_TILE_DIMENSIONS: Record<IconTileSizeType, ITileDimensions> = {
  small: { tile: 40, icon: 24, radius: theme.radius.pill },
  medium: { tile: 48, icon: 30, radius: "16px" },
  large: { tile: 64, icon: 40, radius: theme.radius.panel },
  xlarge: { tile: 72, icon: 44, radius: theme.radius.card },
};

export const useStyles = () =>
  createStyles({
    tile: ({ size, depth }: { size: IconTileSizeType; depth: SurfaceDepthType }) => ({
      ...CENTERED_FLEX,
      flexShrink: 0,
      width: ICON_TILE_DIMENSIONS[size].tile,
      height: ICON_TILE_DIMENSIONS[size].tile,
      backgroundColor: theme.palette.iceWhite,
      borderRadius: ICON_TILE_DIMENSIONS[size].radius,
      boxShadow: SHADOW_BY_SURFACE_DEPTH[depth],
    }),
  });
