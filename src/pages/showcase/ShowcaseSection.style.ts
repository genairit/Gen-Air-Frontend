import { createStyles } from "../../create-styles";
import { theme } from "../../constants/theme.constants";

export const useStyles = () =>
  createStyles({
    section: {
      gap: "28px",
      display: "flex",
      flexDirection: "column",
    },
    heading: {
      gap: "14px",
      display: "flex",
      alignItems: "baseline",
    },
    index: {
      fontSize: 13,
      fontFamily: theme.font.mono,
      color: theme.palette.primary,
    },
    title: {
      margin: 0,
      fontSize: 28,
      fontWeight: 800,
    },
  });
