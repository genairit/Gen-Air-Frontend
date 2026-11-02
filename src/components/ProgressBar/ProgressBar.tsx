import type { FC } from "react";
import { Box } from "@mui/material";
import { useStyles } from "./ProgressBar.style";
import { clampPercentage } from "../../utilities/number.utility";
import SmartbaseProgressBar from "../../vendor/smartbase/components/ProgressBar/ProgressBar";
import { CONTROL_SIZES, type ControlSizeType } from "../../constants/selection-control.constant";

interface IProgressBarProps {
  value: number;
  title?: string;
  caption?: string;
  size?: ControlSizeType;
}

const ProgressBar: FC<IProgressBarProps> = ({
  value,
  title,
  caption,
  size = CONTROL_SIZES.MEDIUM,
}) => {
  const styles = useStyles();
  const percentage = clampPercentage(value);
  const hasHeader = Boolean(title || caption);

  return (
    <Box sx={styles.container}>
      {hasHeader && (
        <Box sx={styles.header}>
          <Box component="span" sx={styles.title}>
            {title}
          </Box>
          <Box component="span" sx={styles.caption}>
            {caption}
          </Box>
        </Box>
      )}
      <SmartbaseProgressBar
        total={100}
        value={percentage}
        showFraction={false}
        ariaLabel={title ?? "התקדמות"}
        ariaValueText={`${percentage}%`}
        size={size === CONTROL_SIZES.SMALL ? "sm" : "md"}
      />
    </Box>
  );
};

export default ProgressBar;
