import { createStyles } from "../../create-styles";
import { theme } from "../../constants/theme.constants";

export const useStyles = () =>
  createStyles({
    banner: {
      gap: "14px",
      display: "flex",
      flexWrap: "wrap",
      padding: "16px 18px",
      alignItems: "center",
      justifyContent: "space-between",
      borderRadius: theme.radius.panel,
      backgroundColor: theme.palette.airBlue,
    },
    content: {
      gap: "12px",
      minWidth: 0,
      display: "flex",
      flex: "1 1 320px",
      alignItems: "flex-start",
    },
    text: {
      gap: "4px",
      fontSize: 14,
      lineHeight: 1.5,
      display: "flex",
      flexDirection: "column",
    },
    actions: {
      gap: "10px",
      display: "flex",
      flexWrap: "wrap",
    },
  });
