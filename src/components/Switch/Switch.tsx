import type { FC } from "react";
import { Box } from "@mui/material";
import { useStyles } from "./Switch.style";

interface ISwitchProps {
  label: string;
  value: boolean;
  disabled?: boolean;
  onChange: (value: boolean) => void;
}

const Switch: FC<ISwitchProps> = ({ label, value, onChange, disabled = false }) => {
  const styles = useStyles();

  const handleToggle = () => {
    if (disabled) {
      return;
    }

    onChange(!value);
  };

  return (
    <Box
      role="switch"
      aria-checked={value}
      onClick={handleToggle}
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
