import { createStyles } from "../../create-styles";

export const useStyles = () =>
  createStyles({
    container: {
      gap: "10px",
      display: "flex",
      alignItems: "flex-start",
    },
    content: {
      flex: 1,
      minWidth: 0,
    },
  });
