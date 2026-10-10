import {
  CHECKBOX_SHAPES,
  type CheckBoxShapeType,
} from "../../constants/selection-control.constant";

import { Box } from "@mui/material";
import Check from "../../icons/Check";
import { type FC, type JSX } from "react";
import { useStyles } from "./CheckBox.style";
import { theme } from "../../constants/theme.constants";

interface ICheckBoxProps {
  value: boolean;
  disabled?: boolean;
  textColor?: string;
  shape?: CheckBoxShapeType;
  text: string | JSX.Element;
  onChange: (value: boolean) => void;
}

const CheckBox: FC<ICheckBoxProps> = ({
  text,
  onChange,
  value = false,
  disabled = false,
  shape = CHECKBOX_SHAPES.SQUARE,
  textColor = theme.palette.charcoal,
}) => {
  const styles = useStyles();

  const handleChange = () => {
    if (disabled) {
      return;
    }

    onChange(!value);
  };

  return (
    <Box
      role="checkbox"
      aria-checked={value}
      onClick={handleChange}
      sx={styles.container({ disabled, textColor })}
    >
      <Box sx={styles.checkBox({ checked: value, shape })}>
        {value && <Check sx={styles.checkIcon} />}
      </Box>
      {text}
    </Box>
  );
};

export default CheckBox;
