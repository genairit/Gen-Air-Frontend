import type { FC } from "react";
import { Box } from "@mui/material";
import { useStyles } from "./RadioButton.style";
import { CONTROL_SIZES, type ControlSizeType } from "../../constants/selection-control.constant";

interface IRadioIndicatorProps {
  checked: boolean;
  size?: ControlSizeType;
}

const RadioIndicator: FC<IRadioIndicatorProps> = ({ checked, size = CONTROL_SIZES.MEDIUM }) => {
  const styles = useStyles();

  return (
    <Box sx={styles.indicator({ size })}>
      <Box sx={styles.dot({ checked, size })} />
    </Box>
  );
};

export default RadioIndicator;
