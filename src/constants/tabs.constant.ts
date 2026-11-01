export const TABS_VARIANTS = {
  STATUS: "status",
  PILLS: "pills",
  SEGMENTED: "segmented",
} as const;

export type TabsVariantType = (typeof TABS_VARIANTS)[keyof typeof TABS_VARIANTS];
