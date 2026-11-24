import { createStyles } from "../../create-styles";
import { theme } from "../../constants/theme.constants";

export const useStyles = () =>
  createStyles({
    link: {
      width: "fit-content",
      maxWidth: "100%",
      fontWeight: 600,
      color: theme.palette.primary,
      overflowWrap: "anywhere",
      "&:focus-visible": { outline: `2px solid ${theme.palette.primary}`, outlineOffset: 3 },
    },
  });
