import { createStyles } from "../../create-styles";
import { theme } from "../../constants/theme.constants";
import { MUTED_CAPTION } from "../../styles/templates.style";

const { palette, softShadow } = theme;

export const useStyles = () =>
  createStyles({
    page: {
      gap: "28px",
      display: "flex",
      minHeight: "100vh",
      padding: "40px 20px",
      alignItems: "center",
      flexDirection: "column",
      justifyContent: "center",
      color: palette.charcoal,
      backgroundColor: palette.iceWhite,
    },
    brand: {
      gap: "8px",
      display: "flex",
      textAlign: "center",
      alignItems: "center",
      flexDirection: "column",
    },
    brandTitle: {
      fontSize: 28,
      fontWeight: 700,
      marginTop: "8px",
      letterSpacing: "0.02em",
    },
    eyebrow: {
      fontSize: 12,
      fontWeight: 600,
      letterSpacing: "0.14em",
      color: palette.textMuted,
    },
    title: {
      fontSize: 26,
      fontWeight: 800,
      margin: "12px 0 0",
    },
    subtitle: {
      fontSize: 15,
      color: palette.textMuted,
    },
    card: {
      width: "min(100%, 460px)",
      boxShadow: softShadow.elevated,
    },
    link: {
      fontSize: 13,
      fontWeight: 600,
      color: palette.danger,
      textDecoration: "none",
      "&:hover": { textDecoration: "underline" },
    },
    divider: {
      height: "1px",
      backgroundColor: palette.divider,
    },
    caption: {
      ...MUTED_CAPTION,
      textAlign: "center",
    },
    smallCaption: {
      fontSize: 12,
      textAlign: "center",
      color: palette.textMuted,
    },
    fullWidth: {
      width: "100%",
    },
  });
