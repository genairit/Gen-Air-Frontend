import { createStyles } from "../../../create-styles";
import { theme } from "../../../constants/theme.constants";
import { MUTED_CAPTION } from "../../../styles/templates.style";

const { palette, softShadow } = theme;

export const useStyles = () =>
  createStyles({
    card: (hasError: boolean) => ({
      boxShadow: hasError ? `inset 0 0 0 2px ${palette.danger}` : softShadow.raised,
    }),
    highlightedSelected: {
      gap: "16px",
      display: "flex",
      flexWrap: "wrap",
      borderRadius: "22px",
      padding: "18px 20px",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: palette.airBlue,
    },
    list: {
      gap: "2px",
      padding: "8px",
      display: "flex",
      flexDirection: "column",
      borderRadius: "24px",
      boxShadow: softShadow.inset,
    },
    listLabel: {
      ...MUTED_CAPTION,
      fontWeight: 600,
      padding: "8px 14px 4px",
    },
    option: (isSelectable: boolean) => ({
      gap: "8px 14px",
      width: "100%",
      display: "flex",
      flexWrap: "wrap",
      textAlign: "start",
      alignItems: "center",
      borderRadius: "18px",
      padding: "12px 14px",
      justifyContent: "space-between",
      fontFamily: theme.font.body,
      color: palette.charcoal,
      opacity: isSelectable ? 1 : 0.55,
      cursor: isSelectable ? "pointer" : "not-allowed",
      "&:hover": { backgroundColor: isSelectable ? palette.airBlue : "transparent" },
    }),
    optionText: {
      gap: "2px",
      minWidth: 0,
      display: "flex",
      flexDirection: "column",
    },
    optionName: {
      fontSize: 15,
      fontWeight: 700,
    },
    caption: MUTED_CAPTION,
    status: {
      gap: "8px",
      display: "flex",
      flexWrap: "wrap",
      alignItems: "center",
    },
    blocked: {
      fontSize: 12,
      fontWeight: 600,
      color: palette.danger,
    },
    emptyRow: {
      ...MUTED_CAPTION,
      padding: "16px 14px",
    },
    selected: {
      gap: "16px",
      display: "flex",
      flexWrap: "wrap",
      borderRadius: "20px",
      padding: "18px 20px",
      alignItems: "center",
      justifyContent: "space-between",
      boxShadow: softShadow.inset,
    },
    selectedText: {
      gap: "6px",
      minWidth: 0,
      display: "flex",
      flexDirection: "column",
      flex: "1 1 280px",
    },
    selectedName: {
      gap: "10px",
      fontSize: 18,
      fontWeight: 800,
      display: "flex",
      flexWrap: "wrap",
      alignItems: "center",
    },
    actions: {
      gap: "10px",
      display: "flex",
      flexWrap: "wrap",
    },
    link: {
      gap: "10px",
      fontSize: 15,
      fontWeight: 600,
      padding: "0 22px",
      alignItems: "center",
      display: "inline-flex",
      textDecoration: "none",
      color: palette.charcoal,
      borderRadius: theme.radius.pill,
      height: theme.controlHeight.medium,
      boxShadow: softShadow.raisedCompact,
      backgroundColor: palette.iceWhite,
    },
  });
