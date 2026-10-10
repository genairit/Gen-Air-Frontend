import { createStyles } from "../../create-styles";
import { theme } from "../../constants/theme.constants";

export const useStyles = () =>
  createStyles({
    card: {
      gap: "12px",
      display: "flex",
      padding: "12px",
      alignItems: "center",
      justifyContent: "space-between",
      borderRadius: theme.radius.panel,
      boxShadow: theme.softShadow.insetCharcoal,
      backgroundColor: theme.palette.charcoalRaised,
    },
    action: {
      fontSize: 13,
      flexShrink: 0,
      fontFamily: "inherit",
      color: theme.palette.sidebarMuted,
    },
  });
