import { theme } from "../../../constants/theme.constants";

export const QUOTATION_CLONE_STYLES = {
  card: {
    gap: "16px",
    display: "grid",
    gridRow: "span 4",
    boxSizing: "border-box",
    gridTemplateRows: "subgrid",
  },
  header: { minHeight: 100, overflowWrap: "anywhere" },
  title: { margin: 0, fontSize: "16px", fontWeight: 700, lineHeight: 1.5 },
  metadata: { margin: "8px 0 0", color: theme.palette.textMuted },
  feedback: {
    gap: "12px",
    minHeight: 150,
    display: "flex",
    marginTop: "auto",
    flexDirection: "column",
    justifyContent: "flex-end",
    overflowWrap: "anywhere",
    borderTop: `1px solid ${theme.palette.divider}`,
    paddingTop: "12px",
  },
  candidate: { display: "flex", flexDirection: "column", gap: "6px" },
  price: { fontWeight: 700, color: theme.palette.charcoal },
  action: { width: "100%", boxShadow: "none" },
  selected: { margin: 0, color: theme.palette.primary, fontWeight: 600 },
} as const;
