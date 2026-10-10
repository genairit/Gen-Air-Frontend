import {
  CHIP_SIZES,
  CHIP_VARIANTS,
  type ChipSizeType,
  type ChipVariantType,
} from "../../constants/chip.constant";

import Dot from "../Dot/Dot";
import type { FC } from "react";
import { useStyles } from "./Chip.style";
import { mergeSx } from "../../utilities/sx.utility";
import { Box, type SxProps, type Theme } from "@mui/material";

interface IChipProps {
  label: string;
  dotColor?: string;
  size?: ChipSizeType;
  sx?: SxProps<Theme>;
  isMonospace?: boolean;
  variant?: ChipVariantType;
}

const Chip: FC<IChipProps> = ({
  sx,
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
      {label}
    </Box>
  );
};

export default Chip;
