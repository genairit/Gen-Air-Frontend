import { createStyles } from "../../create-styles";
import { theme } from "../../constants/theme.constants";

export const useStyles = () =>
  createStyles({
    container: { display: "grid", gap: "8px", minWidth: 0, textAlign: "start" },
    picker: {
      "& .MuiOutlinedInput-root": {
        minHeight: theme.controlHeight.compact,
        borderRadius: "17px",
        backgroundColor: theme.palette.white,
        "&.Mui-focused": { boxShadow: theme.glass.focus },
        "&:not(.Mui-focused):not(.Mui-error) fieldset": { borderColor: theme.glass.border },
      },
      "& .MuiChip-root": { color: theme.palette.primary, backgroundColor: theme.palette.airBlue },
    },
  });
