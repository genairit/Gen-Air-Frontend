import { createStyles } from "../../create-styles";
import { theme } from "../../constants/theme.constants";
import { MONOSPACE_CAPTION } from "../../styles/templates.style";

const DRAGGING_OPACITY = 0.4;

export const useStyles = () =>
  createStyles({
    card: ({ isDragging }: { isDragging: boolean }) => ({
      cursor: "grab",
      boxShadow: theme.softShadow.raisedLarge,
      opacity: isDragging ? DRAGGING_OPACITY : 1,
      "&:hover": { boxShadow: theme.softShadow.raisedHover },
    }),
    row: {
      gap: "8px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
    },
    footer: {
      gap: "8px",
      display: "flex",
      paddingTop: "10px",
      alignItems: "center",
      justifyContent: "space-between",
      borderTop: `1px solid ${theme.palette.divider}`,
    },
    id: {
      ...MONOSPACE_CAPTION,
      fontSize: 11,
    },
    name: {
      fontSize: 17,
      lineHeight: 1.3,
      fontWeight: 700,
    },
    updated: {
      gap: "6px",
      fontSize: 12,
      display: "flex",
      alignItems: "center",
      color: theme.palette.textMuted,
    },
    chevron: {
      fontSize: 16,
      color: theme.palette.charcoal,
    },
  });
