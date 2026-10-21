import { createStyles } from "../../create-styles";
import { theme } from "../../constants/theme.constants";
import { CENTERED_FLEX, MUTED_CAPTION } from "../../styles/templates.style";

const { palette, softShadow, radius } = theme;

export const useStyles = () =>
  createStyles({
    zone: ({ isDragging, compact }: { compact: boolean; isDragging: boolean }) => ({
      display: compact ? "grid" : "flex",
      gridTemplateColumns: compact ? { xs: "1fr", md: "auto minmax(0, 1fr) auto" } : "1fr",
      alignItems: "center",
      columnGap: "20px",
      justifyItems: compact ? { xs: "center", md: "stretch" } : "center",
      "& > :first-child": { gridRow: compact ? { xs: "auto", md: "1 / 3" } : "auto" },
      "& > button": {
        gridColumn: compact ? { xs: "auto", md: 3 } : "auto",
        gridRow: compact ? { xs: "auto", md: "1 / 3" } : "auto",
      },
      "& > b": { gridRow: compact ? { xs: "auto", md: 1 } : "auto" },
      "& > span": { gridRow: compact ? { xs: "auto", md: 2 } : "auto" },
      "& > b, & > span": {
        gridColumn: compact ? { xs: "auto", md: 2 } : "auto",
        textAlign: compact ? { xs: "center", md: "start" } : "center",
        maxWidth: compact ? "none" : 360,
      },
      textAlign: "center",
      boxShadow: softShadow.insetLarge,
      backgroundColor: isDragging ? palette.airBlue : palette.iceWhite,
    }),
    plus: {
      ...CENTERED_FLEX,
      width: 72,
      height: 72,
      fontSize: 26,
      fontWeight: 300,
      color: palette.primary,
      borderRadius: radius.pill,
      boxShadow: softShadow.raisedLarge,
    },
    title: {
      fontSize: 17,
      fontWeight: 700,
    },
    description: {
      ...MUTED_CAPTION,
      maxWidth: 360,
      textWrap: "pretty",
    },
    input: {
      display: "none",
    },
  });
