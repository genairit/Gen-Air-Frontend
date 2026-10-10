import { createStyles } from "../../../create-styles";
import { theme } from "../../../constants/theme.constants";

const { palette } = theme;

export const useStyles = () =>
  createStyles({
    tile: {
      gap: "4px",
      minWidth: 0,
      display: "flex",
      borderRadius: "18px",
      padding: "14px 18px",
      flexDirection: "column",
      boxShadow: theme.softShadow.inset,
    },
    label: {
      fontSize: 12,
      fontWeight: 600,
      color: palette.textMuted,
    },
    value: ({ isLtr }: { isLtr: boolean }) => ({
      fontSize: 15,
      fontWeight: 600,
      textAlign: "right",
      overflowWrap: "anywhere",
      direction: isLtr ? "ltr" : "rtl",
    }),
  });
