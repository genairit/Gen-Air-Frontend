import { createStyles } from "../../../create-styles";
import { theme } from "../../../constants/theme.constants";
import { MOBILE_LAYOUT_QUERY } from "../../../constants/layout.constant";

export const useStyles = () =>
  createStyles({
    card: {
      width: "100%",
      maxWidth: 1120,
      boxSizing: "border-box",
      marginInlineEnd: "auto",
      [`@media ${MOBILE_LAYOUT_QUERY}`]: { padding: "16px" },
    },
    sections: {
      gap: "28px",
      display: "grid",
      gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
      "@media (max-width: 1279px)": { gridTemplateColumns: "minmax(0, 1fr)" },
    },
    accountSection: {
      gap: "18px",
      minWidth: 0,
      display: "flex",
      flexDirection: "column",
    },
    accessSection: {
      gap: "18px",
      minWidth: 0,
      display: "flex",
      paddingInlineStart: "28px",
      flexDirection: "column",
      borderInlineStart: `1px solid ${theme.glass.border}`,
      "@media (max-width: 1279px)": {
        paddingInlineStart: 0,
        paddingBlockStart: "24px",
        borderInlineStart: 0,
        borderBlockStart: `1px solid ${theme.glass.border}`,
      },
    },
    sectionTitle: {
      margin: 0,
      fontSize: 17,
      fontWeight: 700,
      color: theme.palette.charcoal,
    },
    fields: {
      gap: "18px",
      display: "grid",
      gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
      "@media (max-width: 639px)": { gridTemplateColumns: "minmax(0, 1fr)" },
    },
    footer: {
      gap: "16px",
      display: "flex",
      flexWrap: "wrap",
      alignItems: "center",
      paddingBlockStart: "20px",
      borderBlockStart: `1px solid ${theme.glass.border}`,
      [`@media ${MOBILE_LAYOUT_QUERY}`]: { alignItems: "stretch", flexDirection: "column" },
    },
    submitButton: {
      [`@media ${MOBILE_LAYOUT_QUERY}`]: { width: "100%" },
    },
  });
