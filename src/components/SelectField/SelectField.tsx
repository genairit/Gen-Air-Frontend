import type { FC } from "react";
import { useStyles } from "./SelectField.style";
import FieldLabel from "../FieldLabel/FieldLabel";
import { Box, Select, MenuItem, type SelectChangeEvent } from "@mui/material";

interface ISelectFieldProps {
  value: string;
  title?: string;
  ariaLabel: string;
  compact?: boolean;
  disabled?: boolean;
  items: { value: string; label: string }[];
  onChange: (event: SelectChangeEvent<string>) => void;
}

const SelectField: FC<ISelectFieldProps> = ({
  value,
  title,
  compact = false,
  items,
  disabled,
  onChange,
  ariaLabel,
}) => {
  const styles = useStyles({ compact });

  return (
    <Box sx={styles.root}>
      {title && <FieldLabel title={title} />}
      <Select
        displayEmpty
        value={value}
        sx={styles.select}
        disabled={disabled}
        onChange={onChange}
        inputProps={{ "aria-label": ariaLabel }}
      >
        {items.map(item => (
          <MenuItem key={item.value} value={item.value}>
            {item.label}
          </MenuItem>
        ))}
      </Select>
    </Box>
  );
};

export default SelectField;
