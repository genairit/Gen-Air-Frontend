import type { FC } from "react";
import Icon from "../../Icon/Icon";
import { Box } from "@mui/material";
import { useStyles } from "../Jenny.style";
import { theme } from "../../../constants/theme.constants";
import { ICON_NAMES } from "../../../constants/icon.constant";

interface IJennyMarkProps {
  size: number;
  iconSize: number;
}

const JennyMark: FC<IJennyMarkProps> = ({ size, iconSize }) => {
  const styles = useStyles();

  return (
    <Box aria-hidden sx={styles.mark(size)}>
      <Icon size={iconSize} name={ICON_NAMES.AIR} color={theme.palette.white} />
    </Box>
  );
};

export default JennyMark;
