import { createStyles } from "../../create-styles";
import { theme } from "../../constants/theme.constants";

export const useStyles = () =>
  createStyles({
    card: {
      overflow: "hidden",
    },
    header: {
      fontSize: 15,
      width: "100%",
      minHeight: 56,
      fontWeight: 600,
      padding: "0 20px",
      fontFamily: "inherit",
      color: theme.palette.charcoal,
      gap: "12px",
      paddingInlineEnd: "14px",
      justifyContent: "flex-start",
    },
    title: {
      flex: 1,
      textAlign: "start",
    },
    meta: {
      gap: "12px",
      fontSize: 12,
      display: "flex",
      alignItems: "center",
      color: theme.palette.textMuted,
    },
    chevron: {
      fontSize: 14,
      color: theme.palette.charcoal,
    },
    content: {
      gap: "8px",
      display: "flex",
      padding: "0 12px 12px",
      flexDirection: "column",
    },
  });
