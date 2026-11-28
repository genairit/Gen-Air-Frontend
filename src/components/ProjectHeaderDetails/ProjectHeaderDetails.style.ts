import { createStyles } from "../../create-styles";
import { theme } from "../../constants/theme.constants";

export const useStyles = () =>
  createStyles({
    section: {
      minWidth: 0,
      flexBasis: "100%",
      borderTop: `1px solid ${theme.glass.border}`,
      paddingTop: "10px",
    },
    summary: {
      margin: 0,
      display: "grid",
      gridTemplateColumns: "1fr 1fr 2fr",
      gap: "12px",
      "@media (max-width:600px)": { gridTemplateColumns: "1fr" },
    },
    label: { fontSize: 12, fontWeight: 500, color: theme.palette.textMuted },
    value: { margin: 0, fontSize: 14, fontWeight: 600, overflowWrap: "anywhere" },
    disclosure: { "&[open]": { marginTop: "8px" } },
    toggle: {
      cursor: "pointer",
      width: "fit-content",
      paddingBlock: "6px",
      fontSize: 13,
      fontWeight: 600,
      color: theme.palette.primary,
      "&:focus-visible": { outline: `2px solid ${theme.palette.primary}`, outlineOffset: 2 },
    },
    content: {
      paddingBlock: "8px",
      maxHeight: "40dvh",
      overflowY: "auto",
      minWidth: 0,
      "& section": { boxShadow: "none", border: 0, padding: "8px", background: "transparent" },
    },
  });
