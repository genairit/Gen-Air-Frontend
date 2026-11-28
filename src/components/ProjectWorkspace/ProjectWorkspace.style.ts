import { createStyles } from "../../create-styles";
import { theme } from "../../constants/theme.constants";
import { MOBILE_NAV_TOP_PX, MOBILE_LAYOUT_QUERY } from "../../constants/layout.constant";

export const WORKSPACE_DESKTOP = "@media (min-width: 900px) and (min-height: 640px)";

export const useStyles = () =>
  createStyles({
    workspace: {
      minWidth: 0,
      minHeight: 0,
      display: "flex",
      flexDirection: "column",
      gap: "10px",
      "&:has(> footer) :is(input,button,textarea,select)": {
        scrollMarginBlockEnd: `calc(${MOBILE_NAV_TOP_PX + 92}px + env(safe-area-inset-bottom))`,
      },
      [WORKSPACE_DESKTOP]: { flex: "1 1 0" },
      "@media (pointer: coarse)": {
        "& button:not([role=tab])": { minHeight: 44, minWidth: 44 },
        "& [role=tab]": { minHeight: 44 },
      },
    },
    surface: {
      minHeight: 0,
      minWidth: 0,
      [WORKSPACE_DESKTOP]: { flex: "1 1 0" },
    },
    toolbar: {
      display: "flex",
      gap: "8px",
      alignItems: "center",
      justifyContent: "space-between",
      flexWrap: "wrap",
      flexShrink: 0,
    },
    actions: { display: "flex", alignItems: "center", "&:empty": { display: "none" } },
    tabBar: {
      minWidth: 0,
      maxWidth: "100%",
      flexShrink: 1,
      overflowX: "auto",
      padding: "4px",
    },
    panel: {
      minWidth: 0,
      minHeight: 0,
      padding: "4px",
      outlineOffset: "-2px",
      "&:focus-visible": { outline: `2px solid ${theme.palette.primary}` },
      "&[hidden]": { display: "none" },
      "& > section, & > div > section": {
        boxShadow: "none",
        border: 0,
        background: "transparent",
        padding: "10px",
      },
      [WORKSPACE_DESKTOP]: { flex: "1 1 0", overflowY: "auto", scrollbarGutter: "stable" },
    },
    footer: {
      flexShrink: 0,
      minWidth: 0,
      bottom: 0,
      zIndex: 3,
      position: "sticky",
      backgroundColor: theme.palette.white,
      padding: "8px 12px",
      borderRadius: theme.radius.card,
      boxShadow: theme.glass.shadowSmall,
      [`@media ${MOBILE_LAYOUT_QUERY}`]: {
        bottom: `calc(${MOBILE_NAV_TOP_PX + 4}px + env(safe-area-inset-bottom))`,
      },
      [WORKSPACE_DESKTOP]: { position: "static" },
    },
  });
