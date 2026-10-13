import { createStyles } from "../../../create-styles";
import { theme } from "../../../constants/theme.constants";

export const useStyles = () =>
  createStyles({
    failedCard: {
      backgroundColor: theme.palette.errorSurface,
      boxShadow: `inset 0 0 0 2px ${theme.palette.danger}`,
    },
  });
