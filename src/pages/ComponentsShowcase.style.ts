import { createStyles } from "../create-styles";
import { theme } from "../constants/theme.constants";

export const useStyles = () =>
  createStyles({
    page: {
      gap: "72px",
      minWidth: 0,
      width: "100%",
      maxWidth: 1440,
      boxSizing: "border-box",
      margin: "0 auto",
      display: "flex",
      minHeight: "100vh",
      flexDirection: "column",
      color: theme.palette.charcoal,
      backgroundColor: theme.palette.iceWhite,
      padding: "48px clamp(16px, 4vw, 56px) 96px",
    },
  });
