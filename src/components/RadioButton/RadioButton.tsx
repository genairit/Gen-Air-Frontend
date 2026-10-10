import type { FC } from "react";
import { Box } from "@mui/material";
import RadioIndicator from "./RadioIndicator";
import { useStyles } from "./RadioButton.style";

interface IRadioButtonProps {
  label: string;
  checked: boolean;
  onSelect: () => void;
}

const RadioButton: FC<IRadioButtonProps> = ({ label, checked, onSelect }) => {
  const styles = useStyles();

  return (
    <Box role="radio" onClick={onSelect} sx={styles.container} aria-checked={checked}>
      <RadioIndicator checked={checked} />
      {label}
    </Box>
  );
};

export default RadioButton;
