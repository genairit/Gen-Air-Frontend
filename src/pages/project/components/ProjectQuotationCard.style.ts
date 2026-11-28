import { createStyles } from "../../../create-styles";
import { theme } from "../../../constants/theme.constants";
import { MOBILE_LAYOUT_QUERY } from "../../../constants/layout.constant";

export const useStyles = () =>
  createStyles({
    grid: {
      display: "grid",
      gap: "12px",
      gridTemplateColumns: "repeat(auto-fill,minmax(min(100%, 290px), 1fr))",
      [`@media ${MOBILE_LAYOUT_QUERY}`]: { gridTemplateColumns: "minmax(0, 1fr)" },
    },
    card: {
      backgroundColor: theme.palette.white,
      borderColor: theme.glass.border,
      overflowWrap: "anywhere",
    },
    header: {
      display: "flex",
      gap: "8px",
      alignItems: "start",
      justifyContent: "space-between",
    },
    identity: { display: "grid", minWidth: 0, gap: "4px" },
    number: { fontSize: 18, fontWeight: 700 },
    customer: { fontSize: 14, color: theme.palette.textMuted },
    footer: {
      display: "flex",
      gap: "8px",
      flexWrap: "wrap",
      alignItems: "baseline",
      justifyContent: "space-between",
      marginBlockStart: "auto",
    },
    amount: { fontWeight: 700 },
    updated: { fontSize: 12, color: theme.palette.textMuted },
  });
