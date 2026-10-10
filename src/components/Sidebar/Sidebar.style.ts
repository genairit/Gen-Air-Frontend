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
      color: palette.iceWhite,
      borderRadius: "28px",
      boxShadow: softShadow.elevated,
      backgroundColor: palette.charcoal,
    },
    brand: {
      gap: "12px",
      display: "flex",
      padding: "0 6px",
      alignItems: "center",
    },
    brandText: {
      display: "flex",
      flexDirection: "column",
    },
    brandTitle: {
      fontSize: 20,
      fontWeight: 700,
      letterSpacing: "0.02em",
    },
    brandSubtitle: {
      fontSize: 12,
      color: palette.sidebarMuted,
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
      color: palette.statusGray,
    },
    spacer: {
      flex: 1,
    },
    logo: {
      width: 48,
      height: 48,
      display: "flex",
      flexShrink: 0,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: "16px",
      backgroundColor: palette.iceWhite,
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
