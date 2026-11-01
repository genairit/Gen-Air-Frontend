export const DROP_ZONE_APPEARANCE = {
  SOFT: "soft",
  OUTLINED: "outlined",
} as const;

export type DropZoneAppearanceType =
  (typeof DROP_ZONE_APPEARANCE)[keyof typeof DROP_ZONE_APPEARANCE];

export const DROP_ZONE_DESIGN = {
  OUTLINE: "#B9BCC4",
} as const;
