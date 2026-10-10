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
    spinner: {
      color: theme.palette.orange,
    },
    label: MUTED_CAPTION,
  });
