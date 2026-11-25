import { keyframes } from "@mui/material";
import { createStyles } from "../../create-styles";
import { theme } from "../../constants/theme.constants";
import { CENTERED_FLEX, ELLIPSIS_TEXT } from "../../styles/templates.style";
import { PRIMARY_BUTTON_SHADOW } from "../Button/constants/button.constants";
import { MOBILE_LAYOUT_QUERY, REDUCED_MOTION_QUERY } from "../../constants/layout.constant";

const { palette, glass, radius, controlHeight } = theme;

const MOBILE_MEDIA = `@media ${MOBILE_LAYOUT_QUERY}`;
const REDUCED_MOTION_MEDIA = `@media ${REDUCED_MOTION_QUERY}`;

const EDGE_OFFSET_PX = 24;
const LAUNCHER_PANEL_GAP_PX = 12;
const PANEL_BOTTOM_PX = EDGE_OFFSET_PX + controlHeight.large + LAUNCHER_PANEL_GAP_PX;

const PANEL_ENTER = keyframes`
  from { opacity: 0; transform: scale(0.985); }
  to { opacity: 1; transform: scale(1); }
`;

const PANEL_FADE_IN = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const SAFE_AREA_PADDING = {
  HEADER: { paddingTop: "calc(12px + env(safe-area-inset-top))" },
  COMPOSER: { paddingBottom: "calc(12px + env(safe-area-inset-bottom))" },
} as const;

interface IJennyLayoutOptions {
  isFullScreen: boolean;
}

const getSafeAreaPadding = (isFullScreen: boolean, padding: Record<string, string>) => {
  if (!isFullScreen) {
    return {};
  }

  return padding;
};

export const useStyles = () =>
  createStyles({
    launcher: {
      zIndex: "fab",
      position: "fixed",
      bottom: EDGE_OFFSET_PX,
      insetInlineEnd: EDGE_OFFSET_PX,
      boxShadow: `${PRIMARY_BUTTON_SHADOW}, ${glass.shadowSmall}`,
      [MOBILE_MEDIA]: {
        insetInlineEnd: 16,
        bottom: "calc(100px + env(safe-area-inset-bottom))",
      },
    },
    // The host page's 28px flex gap supplies the rest of the ~68px launcher clearance.
    mobileSpacer: {
      height: 40,
      flexShrink: 0,
      display: "none",
      [MOBILE_MEDIA]: { display: "block" },
    },
    panel: {
      zIndex: "fab",
      display: "flex",
      overflow: "hidden",
      position: "fixed",
      flexDirection: "column",
      bottom: PANEL_BOTTOM_PX,
      insetInlineEnd: EDGE_OFFSET_PX,
      borderRadius: radius.card,
      boxShadow: glass.shadow,
      border: `1px solid ${glass.rim}`,
      backgroundColor: palette.white,
      width: `min(360px, calc(100vw - ${2 * EDGE_OFFSET_PX}px))`,
      height: `min(520px, calc(100dvh - ${PANEL_BOTTOM_PX + EDGE_OFFSET_PX}px))`,
      // stylis-plugin-rtl flips physical keywords, so "right" renders at the launcher's left corner.
      transformOrigin: "bottom right",
      animation: `${PANEL_ENTER} 180ms ease-out both`,
      [REDUCED_MOTION_MEDIA]: { animation: `${PANEL_FADE_IN} 120ms linear both` },
    },
    sheetPaper: {
      height: "100dvh",
      display: "flex",
      borderRadius: 0,
      flexDirection: "column",
      backgroundColor: palette.white,
    },
    header: ({ isFullScreen }: IJennyLayoutOptions) => ({
      gap: "12px",
      flexShrink: 0,
      display: "flex",
      alignItems: "center",
      padding: "12px 16px",
      backgroundColor: palette.white,
      borderBottom: `1px solid ${glass.border}`,
      ...getSafeAreaPadding(isFullScreen, SAFE_AREA_PADDING.HEADER),
    }),
    titleBlock: {
      flex: 1,
      minWidth: 0,
      display: "flex",
      flexDirection: "column",
    },
    title: {
      margin: 0,
      fontSize: 16,
      fontWeight: 700,
      lineHeight: 1.3,
      color: palette.charcoal,
    },
    subtitle: {
      ...ELLIPSIS_TEXT,
      fontSize: 12,
      color: palette.textMuted,
    },
    headerActions: {
      gap: "4px",
      flexShrink: 0,
      display: "flex",
      alignItems: "center",
    },
    headerAction: {
      width: 40,
      height: 40,
      color: palette.charcoal,
      "&.Mui-focusVisible": { outline: `2px solid ${palette.primary}`, outlineOffset: "2px" },
    },
    mark: (size: number) => ({
      ...CENTERED_FLEX,
      width: size,
      height: size,
      flexShrink: 0,
      background: glass.gradient,
      borderRadius: radius.pill,
    }),
    composer: ({ isFullScreen }: IJennyLayoutOptions) => ({
      gap: "8px",
      flexShrink: 0,
      display: "flex",
      alignItems: "flex-end",
      padding: "12px 16px 16px",
      backgroundColor: palette.white,
      borderTop: `1px solid ${glass.border}`,
      ...getSafeAreaPadding(isFullScreen, SAFE_AREA_PADDING.COMPOSER),
    }),
    composerField: {
      flex: 1,
      minWidth: 0,
    },
  });
