import type { FC } from "react";
import { Box } from "@mui/material";
import { theme } from "../../constants/theme.constants";

interface IDotProps {
  color: string;
  size?: number;
}

const Dot: FC<IDotProps> = ({ color, size = 7 }) => (
  <Box
    component="span"
    sx={{
      width: size,
      height: size,
      flexShrink: 0,
      backgroundColor: color,
      borderRadius: theme.radius.pill,
    }}
  />
);

export default Dot;
