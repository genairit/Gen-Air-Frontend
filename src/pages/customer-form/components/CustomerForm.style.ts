import { createStyles } from "../../../create-styles";

export const useStyles = () =>
  createStyles({
    sectionTitle: { margin: 0, marginBlockEnd: "12px", fontSize: 16, fontWeight: 700 },
    form: {
      width: "100%",
      maxWidth: 1440,
      marginInline: "auto",
    },
    summaryRow: {
      gap: "24px",
      display: "grid",
      alignItems: "start",
      gridTemplateColumns: "minmax(0, 1fr)",
      "@media (min-width: 1400px)": {
        gridTemplateColumns: "minmax(300px, 1fr) minmax(0, 2fr)",
      },
    },
  });
