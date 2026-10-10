import { theme } from "./theme.constants";

export const SURFACE_DEPTHS = {
  FLAT: "flat",
  INSET: "inset",
  RAISED: "raised",
  RAISED_SOFT: "raisedSoft",
} as const;

export type SurfaceDepthType = (typeof SURFACE_DEPTHS)[keyof typeof SURFACE_DEPTHS];

export const SURFACE_RADII = {
  CARD: "card",
  PILL: "pill",
  PANEL: "panel",
} as const;

export type SurfaceRadiusType = (typeof SURFACE_RADII)[keyof typeof SURFACE_RADII];

export const SHADOW_BY_SURFACE_DEPTH: Record<SurfaceDepthType, string> = {
  flat: "none",
  inset: theme.softShadow.insetDeep,
  raised: theme.softShadow.raised,
  raisedSoft: theme.softShadow.raisedMedium,
};
