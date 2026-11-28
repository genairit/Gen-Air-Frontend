import { createStyles } from "../../../create-styles";
import { theme } from "../../../constants/theme.constants";

const { palette } = theme;

export const useStyles = () =>
  createStyles({
    tile: {
      gap: "8px",
      minWidth: 0,
      display: "flex",
      paddingBlock: "6px",
      flexDirection: "column",
    },
    header: {
      gap: "10px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
    },
    label: {
      fontSize: 14,
      fontWeight: 600,
      color: palette.textMuted,
    },
    valueRow: {
      gap: "10px",
      display: "flex",
      flexWrap: "wrap",
      alignItems: "center",
    },
    value: {
      fontSize: 16,
      overflowWrap: "anywhere",
    },
  });
