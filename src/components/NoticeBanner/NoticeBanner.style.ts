import { createStyles } from "../../create-styles";

export const useStyles = () =>
  createStyles({
    content: {
      gap: "12px",
      minWidth: 0,
      display: "flex",
      flex: 1,
      alignItems: "flex-start",
      flexWrap: "wrap",
      justifyContent: "space-between",
    },
    text: {
      gap: "4px",
      fontSize: 15,
      lineHeight: 1.5,
      display: "flex",
      flexDirection: "column",
    },
    actions: {
      gap: "10px",
      display: "flex",
      flexWrap: "wrap",
    },
  });
