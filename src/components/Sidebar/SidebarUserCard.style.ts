import { createStyles } from "../../create-styles";
import { theme } from "../../constants/theme.constants";

export const useStyles = () =>
  createStyles({
    card: {
      gap: "12px",
      display: "flex",
      padding: "12px",
      alignItems: "center",
      justifyContent: "space-between",
      borderRadius: theme.radius.panel,
      border: `1px solid ${theme.glass.border}`,
      backgroundColor: theme.glass.strong,
    },
    action: {
      fontSize: 13,
      flexShrink: 0,
      fontFamily: "inherit",
      color: theme.palette.textMuted,
    },
  });
