import type { FC } from "react";
import RadioIndicator from "./RadioIndicator";
import { useStyles } from "./RadioButton.style";
import { FormControlLabel, Radio } from "@mui/material";

interface IRadioButtonProps {
  name?: string;
  label: string;
  value?: string;
  checked: boolean;
  onSelect: () => void;
}

const RadioButton: FC<IRadioButtonProps> = ({ name, value, label, checked, onSelect }) => {
  const styles = useStyles();

  return (
    <FormControlLabel
      label={label}
      sx={{ ...styles.container, margin: 0 }}
      control={
        <Radio
          name={name}
          value={value}
          checked={checked}
          onChange={onSelect}
          icon={<RadioIndicator checked={false} />}
          checkedIcon={<RadioIndicator checked />}
          sx={{ padding: 0 }}
        />
      }
    />
  );
};

export default RadioButton;
