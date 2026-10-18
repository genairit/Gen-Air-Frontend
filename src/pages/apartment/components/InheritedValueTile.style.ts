import { createStyles } from "../../../create-styles";
import { theme } from "../../../constants/theme.constants";

const { palette } = theme;

export const useStyles = () =>
  createStyles({
    tile: {
      gap: "8px",
      minWidth: 0,
      display: "flex",
      borderRadius: "18px",
      padding: "16px 18px",
      flexDirection: "column",
      boxShadow: theme.softShadow.inset,
    },
    header: {
      gap: "10px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
    },
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
      fontSize: 16,
      overflowWrap: "anywhere",
    },
    note: {
      fontSize: 13,
      color: palette.textMuted,
    },
    actions: {
      gap: "10px",
      display: "flex",
      flexWrap: "wrap",
      alignItems: "center",
    },
    legend: {
      gap: "10px 16px",
      display: "flex",
      flexWrap: "wrap",
      alignItems: "center",
    },
    legendItem: {
      gap: "8px",
      fontSize: 13,
      display: "flex",
      alignItems: "center",
      color: palette.textMuted,
    },
  });
