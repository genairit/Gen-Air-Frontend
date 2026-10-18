import { createStyles } from "../../create-styles";
import { theme } from "../../constants/theme.constants";

const { palette } = theme;

export const useStyles = () =>
  createStyles({
    tile: (isFullWidth: boolean) => ({
      gap: "4px",
      minWidth: 0,
      display: "flex",
      borderRadius: "18px",
      padding: "14px 18px",
      flexDirection: "column",
      boxShadow: theme.softShadow.inset,
      gridColumn: isFullWidth ? "1 / -1" : "auto",
    }),
    label: {
      fontSize: 12,
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
      fontSize: 15,
      fontWeight: 600,
      overflowWrap: "anywhere",
    },
    note: {
      fontSize: 13,
      color: palette.textMuted,
      overflowWrap: "anywhere",
    },
  });
