import { createStyles } from "../../../create-styles";
import { theme } from "../../../constants/theme.constants";

export const DRIVE_BROWSER_STYLES = createStyles({
  browser: { display: "flex", flexDirection: "column", gap: "6px", minWidth: 0 },
  toolbar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "8px",
    flexWrap: "wrap",
    paddingBlock: "4px",
  },
  breadcrumb: {
    maxWidth: "100%",
    "& button": {
      maxWidth: "100%",
      minWidth: 0,
      whiteSpace: "normal",
      overflowWrap: "anywhere",
      height: "auto",
      minHeight: 36,
      textAlign: "start",
    },
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "6px",
    minWidth: 0,
  },
  folder: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    textAlign: "start",
    width: "100%",
    minWidth: 0,
    overflowWrap: "anywhere",
    "& > b": { minWidth: 0, overflowWrap: "anywhere" },
    minHeight: 44,
    padding: "8px 12px",
    fontSize: 15,
    borderBottom: `1px solid ${theme.glass.border}`,
    "&:focus-visible": { outline: `2px solid ${theme.palette.primary}`, outlineOffset: -2 },
  },
  driveLink: {
    fontSize: 13,
    fontWeight: 600,
    color: theme.palette.primary,
    padding: "8px",
    textDecoration: "none",
  },
  empty: { padding: "12px", fontSize: 14, color: theme.palette.textMuted },
});
