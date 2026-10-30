import { createStyles } from "../../create-styles";
import { MUTED_CAPTION } from "../../styles/templates.style";

export const useStyles = () =>
  createStyles({
    card: {
      flexWrap: "wrap",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    identity: {
      gap: "18px",
      minWidth: 0,
      display: "flex",
      maxWidth: "100%",
      flexWrap: "wrap",
      alignItems: "center",
    },
    details: {
      gap: "10px",
      minWidth: 0,
      display: "flex",
      maxWidth: "100%",
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
      overflowWrap: "anywhere",
    },
    caption: {
      ...MUTED_CAPTION,
      gap: "8px",
      display: "flex",
      alignItems: "center",
    },
    actions: {
      gap: "14px",
      display: "flex",
      flexWrap: "wrap",
    },
  });
