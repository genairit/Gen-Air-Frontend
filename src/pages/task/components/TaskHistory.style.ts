import { createStyles } from "../../../create-styles";
import { theme } from "../../../constants/theme.constants";
import { MUTED_CAPTION } from "../../../styles/templates.style";

const { palette } = theme;

export const useStyles = () =>
  createStyles({
    badge: {
      gap: "8px",
      display: "flex",
      flexWrap: "wrap",
      alignItems: "center",
    },
    createdIn: {
      fontSize: 13,
      fontWeight: 600,
      color: palette.textMuted,
    },
    arrow: {
      fontSize: 14,
      color: palette.textMuted,
    },
    empty: {
      gap: "4px",
      display: "flex",
      flexDirection: "column",
    },
    emptyTitle: {
      fontSize: 15,
      fontWeight: 700,
    },
    caption: MUTED_CAPTION,
    footer: {
      gap: "12px",
      display: "flex",
      flexWrap: "wrap",
      alignItems: "center",
      justifyContent: "space-between",
    },
  });
