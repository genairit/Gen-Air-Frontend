import { createStyles } from "../../create-styles";
import { theme } from "../../constants/theme.constants";

const INDENT_PER_DEPTH = 22;

const getNodeColor = (isLeaf: boolean) =>
  isLeaf ? theme.palette.textMuted : theme.palette.charcoal;

export const useStyles = () =>
  createStyles({
    root: {
      gap: "10px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
    },
    rootLabel: {
      gap: "10px",
      fontWeight: 500,
      display: "flex",
      alignItems: "center",
      fontFamily: theme.font.mono,
    },
    tree: {
      fontSize: 14,
    },
    node: ({ depth, isLeaf }: { depth: number; isLeaf: boolean }) => ({
      gap: "10px",
      display: "flex",
      alignItems: "center",
      color: getNodeColor(isLeaf),
      paddingInlineStart: `${depth * INDENT_PER_DEPTH}px`,
    }),
  });
