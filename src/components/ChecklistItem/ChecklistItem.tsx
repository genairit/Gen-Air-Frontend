import type { FC } from "react";
import { Box } from "@mui/material";
import CheckBox from "../CheckBox/CheckBox";
import { useStyles } from "./ChecklistItem.style";
import { theme } from "../../constants/theme.constants";
import { CHECKBOX_SHAPES } from "../../constants/selection-control.constant";

interface IChecklistItemProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

const getLabelColor = (checked: boolean) =>
  checked ? theme.palette.textMuted : theme.palette.charcoal;

const ChecklistItem: FC<IChecklistItemProps> = ({ label, checked, onChange }) => {
  const styles = useStyles();

  return (
    <Box sx={styles.row({ checked })}>
      <CheckBox
        value={checked}
        onChange={onChange}
        shape={CHECKBOX_SHAPES.CIRCLE}
        textColor={getLabelColor(checked)}
        text={
          <Box component="span" sx={styles.label}>
            {label}
          </Box>
        }
      />
    </Box>
  );
};

export default ChecklistItem;
