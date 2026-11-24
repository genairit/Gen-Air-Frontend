import { theme } from "../../../constants/theme.constants";

export const QUOTATION_CLONE_STYLES = {
  card: { padding: "16px", overflowWrap: "anywhere" },
  form: { gap: "12px", display: "grid", minWidth: 0 },
  title: { margin: 0, fontSize: "20px", fontWeight: 700, lineHeight: 1.5 },
  description: { margin: 0, color: theme.palette.textMuted },
  error: { minWidth: 0, overflowWrap: "anywhere" },
  actions: {
    gap: "12px",
    display: "flex",
    flexWrap: "wrap",
    "@media (max-width: 599px)": { flexDirection: "column", "& > *": { width: "100%" } },
  },
} as const;
