import {
  SURFACE_RADII,
  SURFACE_DEPTHS,
  type SurfaceDepthType,
  type SurfaceRadiusType,
} from "../../constants/surface.constant";

import { useStyles } from "./Card.style";
import type { FC, ReactNode } from "react";
import { mergeSx } from "../../utilities/sx.utility";
import { Box, type SxProps, type Theme } from "@mui/material";

interface ICardProps {
  gap?: string;
  padding?: string;
  sx?: SxProps<Theme>;
  children?: ReactNode;
  onClick?: () => void;
  depth?: SurfaceDepthType;
  radius?: SurfaceRadiusType;
}

const Card: FC<ICardProps> = ({
  sx,
  onClick,
  children,
  gap = "14px",
  padding = "24px",
  depth = SURFACE_DEPTHS.RAISED,
  radius = SURFACE_RADII.CARD,
}) => {
  const styles = useStyles();
  const isClickable = Boolean(onClick);

  return (
    <Box
      onClick={onClick}
      sx={mergeSx(styles.card({ depth, radius, padding, gap, isClickable }), sx ?? null)}
    >
      {children}
    </Box>
  );
};

export default Card;
