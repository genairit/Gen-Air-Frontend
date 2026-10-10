import { createStyles } from "../../create-styles";
import { MUTED_CAPTION } from "../../styles/templates.style";

export const useStyles = () =>
  createStyles({
    container: {
      gap: "12px",
      display: "flex",
      flexWrap: "wrap",
      alignItems: "center",
      justifyContent: "space-between",
    },
    lead: {
      gap: "14px",
      display: "flex",
      alignItems: "center",
    },
    text: {
      gap: "2px",
      display: "flex",
      flexDirection: "column",
    },
    titleRow: {
      gap: "10px",
      flexWrap: "wrap",
      display: "flex",
      alignItems: "center",
    },
    title: {
      fontSize: 20,
      fontWeight: 700,
    },
    subtitle: MUTED_CAPTION,
  });
