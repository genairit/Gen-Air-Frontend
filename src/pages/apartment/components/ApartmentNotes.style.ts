import { createStyles } from "../../../create-styles";
import { theme } from "../../../constants/theme.constants";

const { palette } = theme;

export const useStyles = () =>
  createStyles({
    notesBox: {
      fontSize: 15,
      lineHeight: 1.7,
      borderRadius: "18px",
      padding: "16px 18px",
      whiteSpace: "pre-wrap",
      color: palette.charcoal,
      boxShadow: theme.softShadow.inset,
    },
    link: {
      fontSize: 14,
      fontWeight: 600,
      alignSelf: "flex-start",
      textDecoration: "none",
      color: palette.primary,
    },
  });
