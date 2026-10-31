import type { FC } from "react";
import { Box } from "@mui/material";
import { useStyles } from "./Switch.style";

interface ISwitchProps {
  label: string;
  value: boolean;
  ariaLabel?: string;
  disabled?: boolean;
  onChange: (value: boolean) => void;
}

const Switch: FC<ISwitchProps> = ({ label, value, onChange, ariaLabel, disabled = false }) => {
  const styles = useStyles();

  const handleToggle = () => {
    if (disabled) {
      return;
    }

    onChange(!value);
  };

  return (
    <Box
      type="button"
      role="switch"
      component="button"
      disabled={disabled}
      aria-checked={value}
      onClick={handleToggle}
      aria-label={ariaLabel ?? label}
      sx={styles.container({ disabled })}
    >
      <Box sx={styles.track({ checked: value })}>
        <Box sx={styles.knob({ checked: value })} />
      </Box>
      {label}
    </Box>
  );
};

export default Switch;
