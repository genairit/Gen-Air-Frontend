import { createStyles } from "../../create-styles";
import { theme } from "../../constants/theme.constants";
import { MUTED_CAPTION } from "../../styles/templates.style";

export const useStyles = () =>
  createStyles({
    container: {
      gap: "12px",
      display: "flex",
      padding: "32px",
      alignItems: "center",
      flexDirection: "column",
      justifyContent: "center",
    },
    animation: {
      width: 140,
      height: 140,
      display: "grid",
      placeItems: "center",
    },
    spinner: {
      color: theme.palette.primary,
    },
    label: MUTED_CAPTION,
  });
