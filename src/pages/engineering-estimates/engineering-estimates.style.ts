import { createStyles } from "../../create-styles";
import { theme } from "../../constants/theme.constants";
import { MOBILE_LAYOUT_QUERY } from "../../constants/layout.constant";

export const useEstimateStyles = () =>
  createStyles({
    title: {
      color: theme.palette.textBody,
      fontSize: { xs: 28, sm: 32 },
      fontWeight: 800,
      overflowWrap: "anywhere",
    },
    headerActions: {
      gap: "8px",
      display: "flex",
      flexWrap: "wrap",
      alignItems: "center",
      [`@media ${MOBILE_LAYOUT_QUERY}`]: {
        "& button": { paddingInline: "10px" },
      },
    },
    primaryEditor: {
      gap: "16px",
      display: "grid",
      alignItems: "end",
      gridTemplateColumns: { xs: "minmax(0, 1fr)", md: "minmax(0, 3fr) minmax(110px, 1fr)" },
    },
    details: {
      display: "flex",
      flexWrap: "wrap",
      alignItems: "center",
      gap: "8px 14px",
      color: theme.palette.textMuted,
    },
    totals: {
      paddingBlockStart: "14px",
      borderTop: `1px solid ${theme.glass.border}`,
    },
  });
