import {
  MOBILE_NAV_TOP_PX,
  MOBILE_LAYOUT_QUERY,
  MOBILE_NAV_LAYOUT_PX,
} from "../constants/layout.constant";

import { createStyles } from "../create-styles";
import { theme } from "../constants/theme.constants";

const MOBILE_NAV_SHADOW = "0 10px 28px rgba(15, 23, 42, 0.18)";

const MAIN_MOBILE_BOTTOM_PADDING_PX = MOBILE_NAV_TOP_PX + MOBILE_NAV_LAYOUT_PX.CONTENT_GAP;

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
        padding: `16px 16px calc(${MAIN_MOBILE_BOTTOM_PADDING_PX}px + env(safe-area-inset-bottom))`,
      },
    },
    mobileNavigation: {
      display: "none",
      zIndex: 10,
      bottom: `calc(${MOBILE_NAV_LAYOUT_PX.EDGE_OFFSET}px + env(safe-area-inset-bottom))`,
      height: MOBILE_NAV_LAYOUT_PX.HEIGHT,
      left: MOBILE_NAV_LAYOUT_PX.EDGE_OFFSET,
      right: MOBILE_NAV_LAYOUT_PX.EDGE_OFFSET,
      width: "auto",
      maxWidth: "none",
      position: "fixed",
      padding: "8px",
      boxShadow: MOBILE_NAV_SHADOW,
      [`@media ${MOBILE_LAYOUT_QUERY}`]: { display: "grid" },
    },
  });
