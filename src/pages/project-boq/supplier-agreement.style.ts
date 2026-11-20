import { theme } from "../../constants/theme.constants";

export const supplierAgreementStyles = {
  section: { display: "grid", gap: "12px", minWidth: 0 },
  heading: { fontSize: "1rem", fontWeight: 700 },
  row: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    alignItems: "center",
    paddingBlock: "8px",
    borderBlockEnd: `1px solid ${theme.glass.border}`,
  },
  form: {
    display: "grid",
    gap: "12px",
    gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
  },
  actions: { display: "flex", gap: "8px", flexWrap: "wrap" },
  disclosure: {
    minWidth: 0,
    "& summary": { cursor: "pointer", color: theme.palette.primary, fontWeight: 600 },
  },
} as const;
