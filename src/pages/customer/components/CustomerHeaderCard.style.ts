import { createStyles } from "../../../create-styles";
import { MUTED_CAPTION } from "../../../styles/templates.style";

export const useStyles = () =>
  createStyles({
    card: {
      flexDirection: "row",
      alignItems: "center",
    },
    identity: {
      gap: "18px",
      display: "flex",
      flexWrap: "wrap",
      alignItems: "center",
    },
    details: {
      gap: "10px",
      display: "flex",
      flexDirection: "column",
    },
    titleRow: {
      gap: "12px",
      display: "flex",
      flexWrap: "wrap",
      alignItems: "center",
    },
    title: {
      margin: 0,
      fontSize: 28,
      fontWeight: 800,
    },
    caption: MUTED_CAPTION,
  });
