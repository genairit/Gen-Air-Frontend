import { createStyles } from "../../create-styles";
import { theme } from "../../constants/theme.constants";

const { glass, palette, radius } = theme;

export const useStyles = () =>
  createStyles({
    menuPaper: {
      mt: 1,
      width: 280,
      maxWidth: "calc(100vw - 32px)",
      borderRadius: radius.panel,
      border: `1px solid ${glass.border}`,
      backgroundColor: palette.white,
      boxShadow: glass.shadow,
    },
    menuList: {
      p: 1,
    },
    menuHeading: {
      display: "block",
      px: 1.5,
      py: 1,
      lineHeight: 1.5,
      backgroundColor: "transparent",
      color: palette.textMuted,
      fontSize: 12,
      fontWeight: 600,
      textAlign: "right",
    },
    menuItem: {
      display: "flex",
      minHeight: 60,
      alignItems: "flex-start",
      flexDirection: "column",
      justifyContent: "center",
      gap: 0.25,
      px: 1.5,
      py: 1,
      borderRadius: radius.badge,
      textAlign: "right",
      color: palette.charcoal,
      "&:hover, &.Mui-focusVisible": {
        backgroundColor: palette.surfaceHover,
      },
      "&.Mui-focusVisible": {
        boxShadow: glass.focus,
      },
      "&.Mui-disabled": {
        opacity: 1,
        color: palette.textMuted,
      },
    },
    itemTitle: {
      width: "100%",
      fontSize: 14,
      fontWeight: 600,
      lineHeight: 1.4,
    },
    itemDescription: {
      width: "100%",
      fontSize: 12,
      color: palette.textMuted,
      lineHeight: 1.4,
    },
  });
