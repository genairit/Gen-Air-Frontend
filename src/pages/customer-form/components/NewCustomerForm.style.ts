import { createStyles } from "../../../create-styles";

export const useStyles = () =>
  createStyles({
    form: {
      width: "100%",
      maxWidth: 1440,
      marginInline: "auto",
    },
    contactRow: {
      gap: "24px",
      display: "grid",
      alignItems: "start",
      gridTemplateColumns: "repeat(auto-fit, minmax(min(560px, 100%), 1fr))",
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
