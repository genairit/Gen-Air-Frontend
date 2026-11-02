import type { FC } from "react";
import { useStyles } from "./Segmented.style";
import { Box, ButtonBase } from "@mui/material";
import type { ISegmentedOption } from "../../interfaces/segmented.interface";
import { getSegmentedSelectedIndex } from "../../utilities/segmented.utility";
import { SEGMENTED_SIZES, type SegmentedSizeType } from "../../constants/segmented.constant";

export interface ISegmentedProps {
  value: string;
  disabled?: boolean;
  ariaLabel?: string;
  size?: SegmentedSizeType;
  options: ISegmentedOption[];
  onChange: (value: string) => void;
}

const Segmented: FC<ISegmentedProps> = ({
  value,
  options,
  onChange,
  ariaLabel,
  disabled = false,
  size = SEGMENTED_SIZES.DEFAULT,
}) => {
  const styles = useStyles();

  const selectedIndex = Math.max(getSegmentedSelectedIndex(options, value), 0);

  if (options.length === 0) {
    return null;
  }

  const selectedValue = options[selectedIndex]?.value;

  const handleSelect = (option: ISegmentedOption): void => {
    if (disabled || option.disabled || option.value === value) {
      return;
    }

    onChange(option.value);
  };

  return (
    <Box role="group" aria-label={ariaLabel} sx={styles.root({ size, disabled })}>
      <Box sx={styles.track({ size })}>
        <Box
          sx={styles.thumb({
            size,
            selectedIndex,
            optionsCount: options.length,
          })}
        />
        {options.map(option => {
          const isSelected = option.value === selectedValue;

          return (
            <ButtonBase
              disableRipple
              key={option.value}
              aria-pressed={isSelected}
              onClick={() => handleSelect(option)}
              disabled={disabled || option.disabled}
              sx={styles.option({ isSelected, size })}
            >
              {option.label}
            </ButtonBase>
          );
        })}
      </Box>
    </Box>
  );
};

export default Segmented;
