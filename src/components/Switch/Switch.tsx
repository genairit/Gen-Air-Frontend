import { Box } from "@mui/material";
import { useId, type FC } from "react";
import SmartbaseSwitch from "../../vendor/smartbase/components/Switch/Switch";

interface ISwitchProps {
  label: string;
  value: boolean;
  ariaLabel?: string;
  disabled?: boolean;
  describedBy?: string | null;
  onChange: (value: boolean) => void;
}

const Switch: FC<ISwitchProps> = ({
  label,
  value,
  onChange,
  ariaLabel,
  describedBy = null,
  disabled = false,
}) => {
  const id = useId();
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: "12px", minHeight: 48, fontSize: 15 }}>
      <SmartbaseSwitch
        id={id}
        checked={value}
        disabled={disabled}
        onChange={onChange}
        ariaDescribedBy={describedBy}
        ariaLabel={ariaLabel ?? label}
      />
      <Box
        htmlFor={id}
        component="label"
        sx={{ opacity: disabled ? 0.5 : 1, cursor: disabled ? "default" : "pointer" }}
      >
        {label}
      </Box>
    </Box>
  );
};

export default Switch;
