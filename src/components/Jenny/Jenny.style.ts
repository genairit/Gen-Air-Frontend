import {
  JENNY_MOTION_MS,
  JENNY_LAUNCHER_SIZE_PX,
  JENNY_LAUNCHER_BOTTOM_PX,
  JENNY_LAUNCHER_LAYOUT_PX,
} from "../../constants/jenny.constant";

import { keyframes } from "@mui/material";
import { createStyles } from "../../create-styles";
import { theme } from "../../constants/theme.constants";
import { CENTERED_FLEX, ELLIPSIS_TEXT } from "../../styles/templates.style";
import { PRIMARY_BUTTON_SHADOW } from "../Button/constants/button.constants";
import { MOBILE_LAYOUT_QUERY, REDUCED_MOTION_QUERY } from "../../constants/layout.constant";

const { palette, glass, radius } = theme;

const MOBILE_MEDIA = `@media ${MOBILE_LAYOUT_QUERY}`;
const REDUCED_MOTION_MEDIA = `@media ${REDUCED_MOTION_QUERY}`;

const { EDGE_OFFSET: EDGE_OFFSET_PX, MOBILE_EDGE_OFFSET, GAP } = JENNY_LAUNCHER_LAYOUT_PX;
const PANEL_BOTTOM_PX = JENNY_LAUNCHER_BOTTOM_PX.DESKTOP + JENNY_LAUNCHER_SIZE_PX + GAP;

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
      bottom: JENNY_LAUNCHER_BOTTOM_PX.DESKTOP,
      insetInlineEnd: EDGE_OFFSET_PX,
      boxShadow: `${PRIMARY_BUTTON_SHADOW}, ${glass.shadowSmall}`,
      [MOBILE_MEDIA]: {
        insetInlineEnd: MOBILE_EDGE_OFFSET,
        bottom: `calc(${JENNY_LAUNCHER_BOTTOM_PX.MOBILE}px + env(safe-area-inset-bottom))`,
      },
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
      animation: `${PANEL_ENTER} ${JENNY_MOTION_MS.PANEL_ENTER}ms ease-out both`,
      [REDUCED_MOTION_MEDIA]: {
        animation: `${PANEL_FADE_IN} ${JENNY_MOTION_MS.PANEL_FADE_IN}ms linear both`,
      },
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
