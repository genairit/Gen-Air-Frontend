import { createStyles } from "../../../create-styles";
import { theme } from "../../../constants/theme.constants";

export const useStyles = () =>
  createStyles({
    form: { display: "grid", gap: "16px", textAlign: "start" },
    fields: {
      gap: "16px",
      display: "grid",
      gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
      "@media (max-width: 639px)": { gridTemplateColumns: "minmax(0, 1fr)" },
    },
    securityHint: { margin: 0, fontSize: 13, color: theme.palette.textMuted },
  });
