import { createStyles } from "../../create-styles";
import { theme } from "../../constants/theme.constants";

export const useStyles = () =>
  createStyles({
    message: {
      gap: "8px",
      fontSize: 13,
      display: "flex",
      fontWeight: 600,
      padding: "10px 16px",
      alignItems: "center",
      color: theme.palette.danger,
      borderRadius: "12px",
      border: `1px solid ${theme.palette.airBlueOutline}`,
      backgroundColor: theme.palette.dangerSurface,
    },
  });
