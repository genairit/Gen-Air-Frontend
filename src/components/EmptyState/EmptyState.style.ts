import { createStyles } from "../../create-styles";
import { MUTED_CAPTION } from "../../styles/templates.style";

export const useStyles = () =>
  createStyles({
    card: {
      alignItems: "center",
      textAlign: "center",
    },
    title: {
      fontSize: 20,
      fontWeight: 700,
    },
    description: MUTED_CAPTION,
  });
