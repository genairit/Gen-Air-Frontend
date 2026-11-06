import type { FC } from "react";
import { Box } from "@mui/material";
import RadioIndicator from "./RadioIndicator";
import { useStyles } from "./RadioButton.style";

interface IRadioButtonProps {
  name?: string;
  label: string;
  value?: string;
  checked: boolean;
  onSelect: () => void;
}

const RadioButton: FC<IRadioButtonProps> = ({ name, value, label, checked, onSelect }) => {
  const styles = useStyles();
  const isGrouped = Boolean(name);
  const containerProps = isGrouped
    ? { component: "label" as const }
    : {
        type: "button" as const,
        component: "button" as const,
        role: "radio",
        "aria-checked": checked,
        onClick: onSelect,
      };

  return (
    <Box sx={styles.container} {...containerProps}>
      {isGrouped && (
        <Box
          name={name}
          type="radio"
          value={value}
          component="input"
          checked={checked}
          sx={styles.input}
          onChange={onSelect}
        />
      )}
      <Box aria-hidden>
        <RadioIndicator checked={checked} />
      </Box>
      {label}
    </Box>
  );
};

export default RadioButton;
