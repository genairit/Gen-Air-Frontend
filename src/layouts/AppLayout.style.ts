import {
  MOBILE_LAYOUT_QUERY,
  MOBILE_NAV_LAYOUT_PX,
  MAIN_BOTTOM_PADDING_PX,
} from "../constants/layout.constant";

import { createStyles } from "../create-styles";
import { theme } from "../constants/theme.constants";
import { WORKSPACE_DESKTOP } from "../components/ProjectWorkspace/ProjectWorkspace.style";
import { JENNY_LAUNCHER_BOTTOM_PX, JENNY_LAUNCHER_SIZE_PX } from "../constants/jenny.constant";

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
      [WORKSPACE_DESKTOP]: {
        "&:has(> [data-project-workspace])": {
          height: "100dvh",
          gap: "12px",
          paddingBottom: "18px",
          "&:has(> [data-project-jenny])": {
            paddingBottom: `${JENNY_LAUNCHER_BOTTOM_PX.DESKTOP + JENNY_LAUNCHER_SIZE_PX + 8}px`,
          },
        },
      },
      minWidth: 0,
      gap: "28px",
      display: "flex",
      flexDirection: "column",
      padding: `16px 24px ${MAIN_BOTTOM_PADDING_PX.DESKTOP}px`,
      [`@media ${MOBILE_LAYOUT_QUERY}`]: {
        "&:has(> [data-project-jenny])": {
          paddingBottom: `calc(${JENNY_LAUNCHER_BOTTOM_PX.MOBILE + JENNY_LAUNCHER_SIZE_PX + 8}px + env(safe-area-inset-bottom))`,
        },
        padding: `16px 16px calc(${MAIN_BOTTOM_PADDING_PX.MOBILE}px + env(safe-area-inset-bottom))`,
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
