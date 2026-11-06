import { createStyles } from "../../../create-styles";
import { theme } from "../../../constants/theme.constants";

export const useStyles = () =>
  createStyles({
    actions: {
      minWidth: 0,
      maxWidth: "100%",
      gap: "12px",
      display: "flex",
      flexWrap: "wrap",
      alignItems: "center",
    },
    status: {
      gap: "8px",
      fontSize: 13,
      fontWeight: 600,
      display: "inline-flex",
      padding: "8px 12px",
      alignItems: "center",
      borderRadius: theme.radius.pill,
      boxShadow: theme.glass.edge,
    },
    link: {
      minWidth: 0,
      maxWidth: "100%",
      whiteSpace: "normal",
      overflowWrap: "anywhere",
      boxSizing: "border-box",
      gap: "8px",
      minHeight: 44,
      fontSize: 14,
      fontWeight: 600,
      display: "inline-flex",
      padding: "8px 18px",
      alignItems: "center",
      textDecoration: "none",
      color: theme.palette.charcoal,
      borderRadius: theme.radius.pill,
      boxShadow: theme.glass.edge,
      "&:hover": { textDecoration: "underline" },
      "&:focus-visible": { outline: "2px solid " + theme.palette.primary, outlineOffset: 3 },
    },
  });
