import { createStyles } from "../../create-styles";
import { theme } from "../../constants/theme.constants";

const { palette, softShadow, radius } = theme;

export const useStyles = () =>
  createStyles({
    sidebar: {
      gap: "32px",
      width: 280,
      minHeight: 520,
      display: "flex",
      flexShrink: 0,
      padding: "28px 16px 18px",
      flexDirection: "column",
      color: palette.charcoal,
      borderRadius: "28px",
      boxShadow: softShadow.raised,
      backgroundColor: palette.iceWhite,
    },
    brand: {
      display: "flex",
      padding: "4px 10px",
      justifyContent: "center",
    },
    navigation: {
      gap: "8px",
      display: "flex",
      flexDirection: "column",
    },
    sectionTitle: {
      fontSize: 11,
      fontWeight: 600,
      padding: "0 14px 4px",
      letterSpacing: "0.06em",
      color: palette.textMuted,
    },
    spacer: {
      flex: 1,
    },
    pill: {
      height: 56,
      gap: "12px",
      fontSize: 15,
      width: "100%",
      fontWeight: 600,
      fontFamily: "inherit",
      borderRadius: radius.pill,
      justifyContent: "flex-start",
      paddingInlineEnd: "18px",
      paddingInlineStart: "8px",
    },
  });
