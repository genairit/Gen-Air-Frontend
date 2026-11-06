import { createStyles } from "../create-styles";
import { theme } from "../constants/theme.constants";
import { MOBILE_LAYOUT_QUERY } from "../constants/layout.constant";

const MOBILE_NAV_SHADOW = "0 10px 28px rgba(15, 23, 42, 0.18)";

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
      [`@media ${MOBILE_LAYOUT_QUERY}`]: { display: "none" },
    },
    sidebar: {
      width: "100%",
      height: "100%",
      minHeight: 0,
    },
    main: {
      flex: 1,
      minWidth: 0,
      gap: "28px",
      display: "flex",
      flexDirection: "column",
      padding: "16px 24px 48px",
      [`@media ${MOBILE_LAYOUT_QUERY}`]: {
        padding: "16px 16px calc(112px + env(safe-area-inset-bottom))",
      },
    },
    mobileNavigation: {
      display: "none",
      zIndex: 10,
      bottom: "calc(12px + env(safe-area-inset-bottom))",
      height: 76,
      left: 12,
      right: 12,
      width: "auto",
      maxWidth: "none",
      position: "fixed",
      padding: "8px",
      boxShadow: MOBILE_NAV_SHADOW,
      [`@media ${MOBILE_LAYOUT_QUERY}`]: { display: "grid" },
    },
  });
