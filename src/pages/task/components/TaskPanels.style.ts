import { createStyles } from "../../../create-styles";
import { theme } from "../../../constants/theme.constants";
import { MUTED_CAPTION } from "../../../styles/templates.style";

const { palette } = theme;

export const useStyles = () =>
  createStyles({
    identity: {
      gap: "16px",
      display: "flex",
      alignItems: "center",
    },
    details: {
      gap: "10px",
      minWidth: 0,
      display: "flex",
      flexDirection: "column",
    },
    title: {
      margin: 0,
      fontSize: 28,
      fontWeight: 800,
    },
    metaRow: {
      gap: "10px",
      display: "flex",
      flexWrap: "wrap",
      alignItems: "center",
    },
    caption: MUTED_CAPTION,
    statusLabel: {
      ...MUTED_CAPTION,
      gap: "6px",
      display: "flex",
      alignItems: "center",
    },
    statusTitle: {
      fontWeight: 700,
      color: palette.charcoal,
    },
    urgencyCard: (isUrgent: boolean) => ({
      flexWrap: "wrap",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      color: isUrgent ? palette.white : palette.charcoal,
      backgroundColor: isUrgent ? palette.charcoal : palette.iceWhite,
    }),
    urgencyText: {
      gap: "4px",
      minWidth: 0,
      display: "flex",
      flexDirection: "column",
    },
    urgencyTitle: {
      fontSize: 19,
      fontWeight: 800,
    },
    urgencySubtitle: (isUrgent: boolean) => ({
      fontSize: 13,
      lineHeight: 1.5,
      color: isUrgent ? palette.outline : palette.textMuted,
    }),
    lockNote: {
      ...MUTED_CAPTION,
      gap: "6px",
      fontSize: 12,
      display: "flex",
      alignItems: "center",
    },
    fieldTile: {
      gap: "8px",
      minWidth: 0,
      display: "flex",
      borderRadius: "18px",
      padding: "14px 18px",
      flexDirection: "column",
      boxShadow: theme.softShadow.inset,
    },
    fieldLabel: {
      gap: "8px",
      fontSize: 12,
      fontWeight: 600,
      display: "flex",
      alignItems: "center",
      color: palette.textMuted,
    },
    linkRow: {
      gap: "8px",
      display: "flex",
      flexWrap: "wrap",
      alignItems: "center",
    },
    link: {
      fontSize: 15,
      fontWeight: 700,
      textDecoration: "none",
      color: palette.primary,
    },
    value: {
      fontSize: 15,
      fontWeight: 700,
      whiteSpace: "pre-wrap",
      overflowWrap: "anywhere",
    },
    assignee: {
      gap: "10px",
      display: "flex",
      flexWrap: "wrap",
      alignItems: "center",
    },
  });
