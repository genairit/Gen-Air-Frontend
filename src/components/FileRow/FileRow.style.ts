import { createStyles } from "../../create-styles";
import { theme } from "../../constants/theme.constants";
import { ELLIPSIS_TEXT } from "../../styles/templates.style";

export const useStyles = () =>
  createStyles({
    row: {
      gap: "12px",
      minHeight: 52,
      display: "flex",
      padding: "8px 16px",
      alignItems: "center",
      borderRadius: theme.radius.pill,
      boxShadow: theme.softShadow.inset,
      backgroundColor: theme.palette.iceWhite,
    },
    details: {
      flex: 1,
      minWidth: 0,
      display: "flex",
      flexDirection: "column",
    },
    name: {
      ...ELLIPSIS_TEXT,
      fontSize: 14,
      fontWeight: 500,
    },
    meta: {
      fontSize: 12,
      color: theme.palette.textMuted,
    },
    link: {
      height: 40,
      gap: "6px",
      fontSize: 13,
      flexShrink: 0,
      fontWeight: 600,
      display: "flex",
      padding: "0 14px",
      alignItems: "center",
      textDecoration: "none",
      color: theme.palette.danger,
      borderRadius: theme.radius.pill,
      boxShadow: theme.softShadow.raisedSmall,
      backgroundColor: theme.palette.iceWhite,
      "&:hover": { textDecoration: "underline" },
    },
  });
