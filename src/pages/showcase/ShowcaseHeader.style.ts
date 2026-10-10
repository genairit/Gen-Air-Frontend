import { createStyles } from "../../create-styles";
import { theme } from "../../constants/theme.constants";

const { palette, softShadow, radius } = theme;

const BADGE_STYLE = {
  height: 48,
  fontSize: 14,
  fontWeight: 600,
  display: "flex",
  padding: "0 22px",
  alignItems: "center",
  borderRadius: radius.pill,
};

export const useStyles = () =>
  createStyles({
    eyebrow: {
      fontSize: 13,
      fontWeight: 600,
      letterSpacing: "0.08em",
      color: palette.textMuted,
    },
    title: {
      margin: 0,
      lineHeight: 1,
      fontWeight: 800,
      letterSpacing: "-0.02em",
      fontSize: "clamp(36px, 5vw, 56px)",
    },
    description: {
      margin: 0,
      fontSize: 17,
      maxWidth: 560,
      textWrap: "pretty",
      color: palette.textMuted,
    },
    versionBadge: {
      ...BADGE_STYLE,
      boxShadow: softShadow.raisedLarge,
    },
    localeBadge: {
      ...BADGE_STYLE,
      backgroundColor: palette.airBlue,
    },
  });
