import { theme } from "../constants/theme.constants";

export const ESTIMATE_TYPOGRAPHY = {
  columnHeader: { fontSize: 14, fontWeight: 700 },
  rowValue: { fontSize: 16, fontWeight: 600, overflowWrap: "anywhere" },
  rowName: { fontSize: 18, fontWeight: 700, overflowWrap: "anywhere" },
  number: { fontVariantNumeric: "tabular-nums", fontSize: 16, fontWeight: 700 },
  missing: { fontSize: 16, fontWeight: 700, color: theme.palette.danger },
  status: { fontSize: 14, fontWeight: 700 },
  section: { fontSize: 22, fontWeight: 700 },
  group: { fontSize: 18, fontWeight: 700, overflowWrap: "anywhere" },
  label: { fontSize: 16, fontWeight: 700 },
  total: { fontSize: 24, fontWeight: 800, fontVariantNumeric: "tabular-nums" },
} as const;
