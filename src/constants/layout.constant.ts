export const MOBILE_LAYOUT_QUERY = "(max-width: 899px)";

export const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

export const MOBILE_NAV_LAYOUT_PX = {
  EDGE_OFFSET: 12,
  HEIGHT: 76,
  CONTENT_GAP: 24,
} as const;

export const MOBILE_NAV_TOP_PX = MOBILE_NAV_LAYOUT_PX.EDGE_OFFSET + MOBILE_NAV_LAYOUT_PX.HEIGHT;

export const MAIN_BOTTOM_PADDING_PX = {
  DESKTOP: 48,
  MOBILE: MOBILE_NAV_TOP_PX + MOBILE_NAV_LAYOUT_PX.CONTENT_GAP,
} as const;

export const PAGE_STACK_GAP_PX = 28;
