import { createStyles } from "../../create-styles";
import { theme } from "../../constants/theme.constants";

const { glass, palette, radius, controlHeight } = theme;

export const useStyles = ({ compact }: { compact: boolean }) =>
  createStyles({
    root: { display: "grid", gap: 1, minWidth: 0 },
    select: {
      width: "100%",
      minWidth: 0,
      minHeight: compact ? controlHeight.dense : controlHeight.compact,
      borderRadius: radius.badge,
      backgroundColor: palette.white,
      boxShadow: glass.edge,
      "& .MuiOutlinedInput-notchedOutline": { border: 0 },
      "&.Mui-focused": { boxShadow: `${glass.selectedEdge}, ${glass.focus}` },
    },
  });
