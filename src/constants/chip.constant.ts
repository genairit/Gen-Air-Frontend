import { theme } from "./theme.constants";

export const CHIP_VARIANTS = {
  INFO: "info",
  PLAIN: "plain",
  DARK: "dark",
  ALERT: "alert",
  INSET: "inset",
  RAISED: "raised",
} as const;

export type ChipVariantType = (typeof CHIP_VARIANTS)[keyof typeof CHIP_VARIANTS];

export const CHIP_SIZES = {
  SMALL: "small",
  MEDIUM: "medium",
} as const;

export type ChipSizeType = (typeof CHIP_SIZES)[keyof typeof CHIP_SIZES];

export const CHIP_ICON_COLOR_BY_VARIANT: Record<ChipVariantType, string> = {
  info: theme.palette.charcoal,
  plain: theme.palette.charcoal,
  raised: theme.palette.charcoal,
  dark: theme.palette.iceWhite,
  alert: theme.palette.white,
  inset: theme.palette.primary,
};
