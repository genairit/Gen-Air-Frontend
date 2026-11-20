import { createStyles } from "../../create-styles";
import { theme } from "../../constants/theme.constants";

const { glass, palette, radius } = theme;

export const useStyles = () =>
  createStyles({
    root: {
      minWidth: 0,
      textAlign: "start",
      color: palette.charcoal,
      borderRadius: radius.badge,
      transition: "background-color 0.18s ease, box-shadow 0.18s ease",
      "&:hover": { backgroundColor: palette.surfaceHover },
      "&.Mui-focusVisible": { boxShadow: `${glass.selectedEdge}, ${glass.focus}` },
    },
  });
