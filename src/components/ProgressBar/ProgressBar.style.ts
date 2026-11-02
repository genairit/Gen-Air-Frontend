import { createStyles } from "../../create-styles";
import { theme } from "../../constants/theme.constants";

const { palette } = theme;

export const useStyles = () =>
  createStyles({
    container: {
      gap: "10px",
      width: "100%",
      display: "flex",
      flexDirection: "column",
    },
    header: {
      fontSize: 13,
      display: "flex",
      justifyContent: "space-between",
    },
    title: {
      fontWeight: 600,
    },
    caption: {
      color: palette.textMuted,
    },
  });
