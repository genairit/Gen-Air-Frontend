import { createStyles } from "../../../create-styles";
import { theme } from "../../../constants/theme.constants";

export const useStyles = () =>
  createStyles({
    grid: {
      gap: "14px",
      display: "grid",
      gridTemplateColumns: { xs: "minmax(0, 1fr)", sm: "repeat(2, minmax(0, 1fr))" },
    },
    card: {
      boxShadow: "none",
      backgroundColor: theme.palette.white,
      border: `1px solid ${theme.glass.border}`,
      borderInlineStart: `3px solid ${theme.palette.primary}`,
      "&:hover": {
        borderColor: theme.palette.airBlueOutline,
        backgroundColor: theme.palette.surfaceHover,
      },
    },
    header: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "12px",
      minWidth: 0,
    },
    icon: {
      display: "grid",
      placeItems: "center",
      width: 36,
      height: 36,
      borderRadius: "10px",
      backgroundColor: theme.palette.airBlue,
      color: theme.palette.primary,
    },
    name: { margin: 0, fontSize: 18, fontWeight: 700, lineHeight: 1.4, overflowWrap: "anywhere" },
    footer: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      flexWrap: "wrap",
      gap: "8px",
      paddingTop: "10px",
      borderTop: `1px solid ${theme.glass.border}`,
    },
    date: {
      fontSize: 13,
      color: theme.palette.textMuted,
      display: "flex",
      gap: "5px",
      flexWrap: "wrap",
    },
    open: {
      display: "inline-flex",
      alignItems: "center",
      gap: "5px",
      color: theme.palette.primary,
      fontWeight: 700,
      fontSize: 13,
    },
  });
