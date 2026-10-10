export const ICON_TILE_SIZES = {
  SMALL: "small",
  MEDIUM: "medium",
  LARGE: "large",
  XLARGE: "xlarge",
} as const;

export type IconTileSizeType = (typeof ICON_TILE_SIZES)[keyof typeof ICON_TILE_SIZES];
