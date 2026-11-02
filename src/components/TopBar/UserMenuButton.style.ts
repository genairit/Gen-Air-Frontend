import { createStyles } from "../../create-styles";
import { theme } from "../../constants/theme.constants";

const { palette, glass, radius } = theme;

export const useStyles = () =>
  createStyles({
    button: {
      gap: "12px",
      height: 52,
      fontFamily: "inherit",
      padding: "0 18px 0 6px",
      borderRadius: radius.pill,
      color: palette.charcoal,
      border: `1px solid ${glass.border}`,
      boxShadow: glass.shadowSmall,
      backgroundColor: palette.white,
    },
    chevron: {
      fontSize: 11,
      color: palette.textMuted,
    },
  });
