import { createStyles } from "../../create-styles";

export const useStyles = () =>
  createStyles({
    list: {
      margin: 0,
      padding: 0,
      display: "flex",
      listStyle: "none",
      flexDirection: "column",
    },
  });
