import { createStyles } from "../../create-styles";
import { theme } from "../../constants/theme.constants";
import { DROP_ZONE_DESIGN } from "../../constants/drop-zone.constant";
import { CENTERED_FLEX, MUTED_CAPTION } from "../../styles/templates.style";

const { palette, softShadow, radius } = theme;

export const useStyles = () =>
  createStyles({
    zone: ({
      isDragging,
      compact,
      isOutlined,
    }: {
      compact: boolean;
      isDragging: boolean;
      isOutlined: boolean;
    }) => ({
      position: "relative",
      border: isOutlined ? `2px dashed ${DROP_ZONE_DESIGN.OUTLINE}` : "none",
      gap: isOutlined ? "12px" : "14px",
      "&:focus-within": { outline: `2px solid ${palette.primary}`, outlineOffset: 3 },
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
        maxWidth: compact || isOutlined ? "none" : 360,
      },
      textAlign: "center",
      boxShadow: isOutlined ? softShadow.inset : softShadow.insetLarge,
      backgroundColor: isDragging ? palette.airBlue : palette.iceWhite,
    }),
    plus: ({ isOutlined }: { isOutlined: boolean }) => ({
      ...CENTERED_FLEX,
      width: isOutlined ? 64 : 72,
      height: isOutlined ? 64 : 72,
      fontSize: isOutlined ? 28 : 26,
      fontWeight: 300,
      color: palette.primary,
      borderRadius: isOutlined ? radius.panel : radius.pill,
      boxShadow: isOutlined ? softShadow.raisedMedium : softShadow.raisedLarge,
    }),
    title: {
      fontSize: 17,
      fontWeight: 700,
    },
    description: {
      ...MUTED_CAPTION,
      maxWidth: 360,
      textWrap: "pretty",
    },
    input: ({ isOutlined }: { isOutlined: boolean }) => ({
      display: isOutlined ? "block" : "none",
      position: "absolute",
      inset: 0,
      width: "100%",
      height: "100%",
      opacity: 0,
      cursor: "pointer",
    }),
  });
