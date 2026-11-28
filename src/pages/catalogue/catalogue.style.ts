import { createStyles } from "../../create-styles";
import { theme } from "../../constants/theme.constants";

export const useCatalogueStyles = () =>
  createStyles({
    title: { margin: 0, fontSize: { xs: 28, sm: 32 }, fontWeight: 800, overflowWrap: "anywhere" },
    sectionTitle: { margin: 0, fontSize: 18, fontWeight: 700 },
    filters: {
      display: "flex",
      flexWrap: "wrap",
      alignItems: "center",
      gap: "10px 18px",
    },
    search: { flex: { xs: "1 0 100%", sm: "0 1 420px" }, minWidth: 0 },
    fieldGrid: {
      gap: "16px",
      display: "grid",
      alignItems: "end",
      gridTemplateColumns: { xs: "minmax(0, 1fr)", sm: "repeat(2, minmax(0, 1fr))" },
    },
    optional: {
      overflowWrap: "anywhere",
      "& > summary": {
        cursor: "pointer",
        fontSize: 16,
        fontWeight: 700,
      },
      "&[open] > summary": { marginBlockEnd: "14px" },
    },
    mobileRow: {
      gap: "6px",
      minWidth: 0,
      padding: "12px",
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-start",
      textAlign: "start",
      border: `1px solid ${theme.glass.border}`,
      borderRadius: "14px",
      overflowWrap: "anywhere",
    },
    mobileMetadata: {
      gap: "8px 16px",
      display: "flex",
      flexWrap: "wrap",
      color: theme.palette.textMuted,
    },
  });
