import { createStyles } from "../../create-styles";
import { theme } from "../../constants/theme.constants";

export const useStyles = () =>
  createStyles({
    charCounter: {
      fontSize: 13,
      color: theme.palette.textMuted,
      fontWeight: 600,
      direction: "ltr",
      letterSpacing: "0.15em",
    },
  });
