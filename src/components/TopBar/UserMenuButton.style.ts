import { createStyles } from "../../create-styles";
import { theme } from "../../constants/theme.constants";

const { palette, softShadow, radius } = theme;

export const useStyles = () =>
  createStyles({
    button: {
      gap: "12px",
      height: 52,
      fontFamily: "inherit",
      padding: "0 18px 0 6px",
      borderRadius: radius.pill,
      color: palette.charcoal,
      boxShadow: softShadow.raisedCompact,
      backgroundColor: palette.iceWhite,
    },
    chevron: {
      fontSize: 11,
      color: palette.textMuted,
    },
  });
