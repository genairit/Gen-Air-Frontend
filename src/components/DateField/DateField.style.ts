import { createStyles } from "../../create-styles";
import { theme } from "../../constants/theme.constants";

const { glass, palette, radius } = theme;

export const useStyles = () =>
  createStyles({
    calendarIcon: {
      fontSize: 20,
      color: palette.textMuted,
      pointerEvents: "none",
    },
    popoverPaper: {
      mt: 1,
      p: 2,
      width: 372,
      maxWidth: "calc(100vw - 32px)",
      overflow: "visible",
      direction: "rtl",
      borderRadius: radius.panel,
      border: `1px solid ${glass.border}`,
      backgroundColor: palette.white,
      boxShadow: glass.shadow,
    },
    clearRow: {
      display: "flex",
      justifyContent: "flex-start",
      pt: 1,
      mt: 1,
      borderTop: `1px solid ${glass.border}`,
    },
  });
