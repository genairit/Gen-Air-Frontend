import {
  CHIP_SIZES,
  CHIP_VARIANTS,
  type ChipSizeType,
  type ChipVariantType,
  CHIP_ICON_COLOR_BY_VARIANT,
} from "../../constants/chip.constant";

import Dot from "../Dot/Dot";
import Icon from "../Icon/Icon";
import type { FC } from "react";
import { useStyles } from "./Chip.style";
import { mergeSx } from "../../utilities/sx.utility";
import { Box, type SxProps, type Theme } from "@mui/material";
import type { IconNameType } from "../../constants/icon.constant";

interface IChipProps {
  label: string;
  dotColor?: string;
  icon?: IconNameType;
  size?: ChipSizeType;
  sx?: SxProps<Theme>;
  isMonospace?: boolean;
  variant?: ChipVariantType;
}

const Chip: FC<IChipProps> = ({
  sx,
  icon,
  label,
  dotColor,
  isMonospace = false,
  size = CHIP_SIZES.SMALL,
  variant = CHIP_VARIANTS.INFO,
}) => {
  const styles = useStyles();

  return (
    <Box component="span" sx={mergeSx(styles.chip({ variant, size, isMonospace }), sx ?? null)}>
      {dotColor && <Dot color={dotColor} />}
      {icon && <Icon size={16} name={icon} color={CHIP_ICON_COLOR_BY_VARIANT[variant]} />}
      {label}
    </Box>
  );
};

export default Chip;
