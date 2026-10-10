import type { FC } from "react";
import Icon from "../Icon/Icon";
import { Box } from "@mui/material";
import type { IconNameType } from "../../constants/icon.constant";
import { useStyles, ICON_TILE_DIMENSIONS } from "./IconTile.style";
import { SURFACE_DEPTHS, type SurfaceDepthType } from "../../constants/surface.constant";
import { ICON_TILE_SIZES, type IconTileSizeType } from "../../constants/icon-tile.constant";

interface IIconTileProps {
  iconColor?: string;
  name: IconNameType;
  size?: IconTileSizeType;
  depth?: SurfaceDepthType;
}

const IconTile: FC<IIconTileProps> = ({
  name,
  iconColor,
  size = ICON_TILE_SIZES.MEDIUM,
  depth = SURFACE_DEPTHS.RAISED_SOFT,
}) => {
  const styles = useStyles();

  return (
    <Box sx={styles.tile({ size, depth })}>
      <Icon name={name} color={iconColor} size={ICON_TILE_DIMENSIONS[size].icon} />
    </Box>
  );
};

export default IconTile;
