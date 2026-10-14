import { createStyles } from "../../../../create-styles";
import { theme } from "../../../../constants/theme.constants";

const { palette, softShadow } = theme;

export const useStyles = () =>
  createStyles({
    bar: {
      gap: "4px",
      height: 6,
      display: "flex",
      overflow: "hidden",
      borderRadius: theme.radius.pill,
    },
    segment: ({ color, share }: { color: string; share: number }) => ({
      flex: share,
      backgroundColor: color,
      borderRadius: theme.radius.pill,
    }),
    tiles: {
      gap: "14px",
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(min(140px, 100%), 1fr))",
    },
    tile: (isActive: boolean) => ({
      gap: "6px",
      border: 0,
      display: "flex",
      cursor: "pointer",
      textAlign: "start",
      padding: "14px 18px",
      borderRadius: "18px",
      flexDirection: "column",
      fontFamily: theme.font.body,
      color: palette.charcoal,
      boxShadow: isActive ? softShadow.inset : softShadow.raisedCompact,
      backgroundColor: isActive ? palette.airBlue : palette.iceWhite,
    }),
    tileLabel: {
      gap: "8px",
      fontSize: 13,
      fontWeight: 600,
      display: "flex",
      alignItems: "center",
      color: palette.textBody,
    },
    tileCount: {
      fontSize: 26,
      fontWeight: 800,
    },
  });
