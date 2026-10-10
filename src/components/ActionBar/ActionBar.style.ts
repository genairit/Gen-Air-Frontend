import { createStyles } from "../../create-styles";
import { MUTED_CAPTION } from "../../styles/templates.style";

export const useStyles = () =>
  createStyles({
    bar: {
      flexWrap: "wrap",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    caption: {
      ...MUTED_CAPTION,
      gap: "8px",
      display: "flex",
      padding: "0 16px",
      flex: "1 1 280px",
      alignItems: "center",
    },
    actions: {
      gap: "12px",
      display: "flex",
      flexWrap: "wrap",
    },
  });
