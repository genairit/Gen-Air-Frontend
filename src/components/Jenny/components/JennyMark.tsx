import type { FC } from "react";
import Icon from "../../Icon/Icon";
import { Box } from "@mui/material";
import { useStyles } from "../Jenny.style";
import { theme } from "../../../constants/theme.constants";
import { ICON_NAMES } from "../../../constants/icon.constant";
import { JENNY_MARK_SIZES, type JennyMarkPresetType } from "../../../constants/jenny.constant";

interface IJennyMarkProps {
  preset: JennyMarkPresetType;
}

const JennyMark: FC<IJennyMarkProps> = ({ preset }) => {
  const styles = useStyles();
  const { size, iconSize } = JENNY_MARK_SIZES[preset];

  return (
    <Box aria-hidden sx={styles.mark(size)}>
      <Icon size={iconSize} name={ICON_NAMES.AIR} color={theme.palette.white} />
    </Box>
  );
};

export default JennyMark;
