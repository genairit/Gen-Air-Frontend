import { createStyles } from "../../../create-styles";
import { theme } from "../../../constants/theme.constants";

export const useStyles = () =>
  createStyles({
    title: {
      fontSize: 19,
      fontWeight: 800,
      color: theme.palette.charcoal,
    },
  });
