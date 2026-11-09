export const TABS_VARIANTS = {
  STATUS: "status",
  PILLS: "pills",
  SEGMENTED: "segmented",
} as const;

export type TabsVariantType = (typeof TABS_VARIANTS)[keyof typeof TABS_VARIANTS];

export const ACTIVE_TAB_SELECTOR =
  '[data-tab-option][aria-selected="true"], [data-tab-option][aria-pressed="true"]';

export const TAB_MODES = { TABS: "tabs", FILTER: "filter" } as const;

export type TabsModeType = (typeof TAB_MODES)[keyof typeof TAB_MODES];

export const TAB_NAVIGATION_KEYS = {
  HOME: "Home",
  END: "End",
  NEXT: "ArrowLeft",
  PREVIOUS: "ArrowRight",
} as const;

export type TabNavigationKeyType = (typeof TAB_NAVIGATION_KEYS)[keyof typeof TAB_NAVIGATION_KEYS];
