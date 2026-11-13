import { createStyles } from "../../create-styles";
import { theme } from "../../constants/theme.constants";

export const useStyles = () =>
  createStyles({
    content: {
      gap: "12px",
      display: "flex",
      textAlign: "start",
      flexDirection: "column",
    },
    context: {
      margin: 0,
      fontSize: 15,
      lineHeight: 1.7,
      color: theme.palette.charcoal,
    },
  });
