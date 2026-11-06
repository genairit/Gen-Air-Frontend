import { theme } from "../../theme";
import { useStyles } from "./CheckBox.style";
import BoldCheck from "../../icons/BoldCheck";
import type { ChangeEvent, CSSProperties, FC, ReactNode } from "react";
import { Box, Checkbox, FormControlLabel, type CheckboxProps } from "@mui/material";

interface ICheckBoxProps extends Omit<
  CheckboxProps,
  "sx" | "value" | "checked" | "onChange" | "defaultChecked"
> {
  value?: boolean;
  text: ReactNode;
  sx?: CSSProperties;
  textColor?: string;
  shape?: "square" | "circle";
  onChange: (checked: boolean) => void;
}

const CheckBox: FC<ICheckBoxProps> = ({
  sx,
  text,
  onChange,
  shape = "square",
  textColor = theme.colors.ink,
  value = false,
  disabled = false,
  ...checkboxProps
}) => {
  const styles = useStyles();
  const checked = value;

  const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    onChange(event.target.checked);
  };

  const rootSx = { ...styles.root(textColor), ...sx, ...styles.disabledState(disabled) };

  const checkboxIcon = (
    <Box sx={styles.box({ checked, shape })}>
      <BoldCheck sx={styles.check(checked)} />
    </Box>
  );

  return (
    <FormControlLabel
      sx={rootSx}
      label={text}
      disabled={disabled}
      control={
        <Checkbox
          disableRipple
          checked={checked}
          icon={checkboxIcon}
          sx={styles.checkbox}
          onChange={handleChange}
          checkedIcon={checkboxIcon}
          {...checkboxProps}
        />
      }
    />
  );
};

export default CheckBox;
