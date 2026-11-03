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
    menuItem: {
      gap: "12px",
      minHeight: 44,
      color: palette.charcoal,
      "&[aria-checked='true']": {
        backgroundColor: palette.airBlue,
      },
    },
    roleLabel: {
      flex: 1,
      textAlign: "right",
      whiteSpace: "nowrap",
    },
    selectedCheck: {
      color: palette.primary,
    },
    error: {
      px: 2,
      py: 1,
      maxWidth: 320,
      color: palette.danger,
    },
  });
