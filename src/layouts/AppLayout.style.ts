import { createStyles } from "../create-styles";
import { theme } from "../constants/theme.constants";

const MOBILE_NAV_SHADOW = "0 10px 28px rgba(30, 32, 34, 0.25)";

export const useStyles = () =>
  createStyles({
    shell: {
      display: "flex",
      minHeight: "100vh",
      color: theme.palette.charcoal,
      backgroundColor: theme.palette.iceWhite,
    },
    sidebarSlot: {
      top: 0,
      width: 272,
      flexShrink: 0,
      height: "100vh",
      position: "sticky",
      paddingBlock: "16px",
      paddingInlineStart: "16px",
    },
    sidebar: {
      width: "100%",
      height: "100%",
      minHeight: 0,
    },
    main: ({ isMobile }: { isMobile: boolean }) => ({
      flex: 1,
      minWidth: 0,
      gap: "28px",
      display: "flex",
      flexDirection: "column",
      padding: isMobile ? "16px 16px 112px" : "16px 24px 48px",
    }),
    mobileNavigation: {
      zIndex: 10,
      bottom: 12,
      height: 76,
      left: 12,
      right: 12,
      width: "auto",
      maxWidth: "none",
      position: "fixed",
      padding: "8px",
      boxShadow: MOBILE_NAV_SHADOW,
    },
  });
