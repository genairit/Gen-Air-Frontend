import { createStyles } from "../../create-styles";
import { theme } from "../../constants/theme.constants";
import { ELLIPSIS_TEXT } from "../../styles/templates.style";

export const useStyles = () =>
  createStyles({
    compact: {
      padding: "6px 10px",
      minHeight: 44,
      borderRadius: 0,
      boxShadow: "none",
      gap: "6px",
      "& button": { minHeight: 32, height: 32, paddingInline: "10px", fontSize: 12 },
      "@media (pointer: coarse)": { "& button, & a": { minHeight: 44, minWidth: 44 } },
    },
    row: {
      gap: "12px",
      minHeight: 52,
      display: "flex",
      flexWrap: "wrap",
      padding: "8px 16px",
      alignItems: "center",
      borderRadius: theme.radius.pill,
      border: `1px solid ${theme.glass.border}`,
      backgroundColor: theme.glass.strong,
    },
    details: {
      flex: 1,
      minWidth: 0,
      display: "flex",
      flexDirection: "column",
    },
    name: {
      ...ELLIPSIS_TEXT,
      color: "inherit",
      textDecoration: "none",
      "&:hover": { textDecoration: "underline" },
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
      color: theme.palette.charcoal,
      borderRadius: theme.radius.pill,
      border: `1px solid ${theme.glass.border}`,
      boxShadow: theme.glass.shadowSmall,
      backgroundColor: theme.palette.white,
      "&:hover": { textDecoration: "underline" },
    },
  });
