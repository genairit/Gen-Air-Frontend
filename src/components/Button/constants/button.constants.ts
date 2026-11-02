import type { Theme } from "@mui/material";
import type { SystemStyleObject } from "@mui/system";
import { theme } from "../../../constants/theme.constants";
import type { TButtonVariant } from "../../../vendor/smartbase/components/Button/constants/button.constant";

export const BUTTON_VARIANTS = {
  DARK: "dark",
  DANGER: "danger",
  DASHED: "dashed",
  NEUTRAL: "neutral",
  PRESSED: "pressed",
  PRIMARY: "primary",
  SECONDARY: "secondary",
} as const;

export type ButtonVariantType = (typeof BUTTON_VARIANTS)[keyof typeof BUTTON_VARIANTS];

export const SMARTBASE_VARIANT_BY_BUTTON_VARIANT: Record<ButtonVariantType, TButtonVariant> = {
  dark: "primary",
  danger: "outlined",
  dashed: "outlined",
  neutral: "outlined",
  pressed: "active",
  primary: "primary",
  secondary: "secondary",
};

export const BUTTON_SIZES = {
  LARGE: "large",
  MEDIUM: "medium",
  COMPACT: "compact",
} as const;

export type ButtonSizeType = (typeof BUTTON_SIZES)[keyof typeof BUTTON_SIZES];

export const BUTTON_SHAPES = {
  PILL: "pill",
  CIRCLE: "circle",
} as const;

export type ButtonShapeType = (typeof BUTTON_SHAPES)[keyof typeof BUTTON_SHAPES];

type TButtonStyle = SystemStyleObject<Theme>;

const { palette, glass, controlHeight } = theme;

export const STYLE_BY_VARIANT: Record<ButtonVariantType, TButtonStyle> = {
  primary: {
    fontWeight: 700,
    color: palette.white,
    boxShadow: "0 6px 14px -6px rgba(22, 104, 189, 0.55)",
    background: glass.gradient,
    "&:hover": { boxShadow: "0 9px 18px -7px rgba(22, 104, 189, 0.55)" },
  },
  secondary: {
    color: palette.charcoal,
    backgroundColor: palette.airBlue,
    boxShadow: glass.shadowSmall,
    "&:hover": { backgroundColor: palette.airBlue },
  },
  neutral: {
    color: palette.charcoal,
    border: `1px solid ${glass.border}`,
    backgroundColor: palette.white,
    boxShadow: glass.shadowSmall,
    "&:hover": { backgroundColor: palette.iceWhite },
  },
  pressed: {
    color: palette.primary,
    border: `1px solid ${palette.primary}`,
    backgroundColor: palette.airBlue,
  },
  danger: {
    color: palette.danger,
    backgroundColor: "transparent",
    "&:hover": { backgroundColor: palette.dangerSurface },
  },
  dark: {
    color: palette.iceWhite,
    boxShadow: glass.shadowSmall,
    backgroundColor: palette.charcoal,
    "&:hover": { backgroundColor: palette.charcoal },
  },
  dashed: {
    color: palette.charcoal,
    backgroundColor: "transparent",
    border: `2px dashed ${palette.outline}`,
    "&:hover": { backgroundColor: "transparent", borderColor: palette.charcoal },
  },
};

export const STYLE_BY_SIZE: Record<ButtonSizeType, TButtonStyle> = {
  compact: { height: controlHeight.compact, padding: "0 14px", fontSize: 13 },
  medium: { height: controlHeight.medium, padding: "0 28px", fontSize: 15 },
  large: { height: controlHeight.large, padding: "0 32px", fontSize: 16 },
};

export const CIRCLE_WIDTH_BY_SIZE: Record<ButtonSizeType, number> = {
  compact: controlHeight.compact,
  medium: controlHeight.medium,
  large: controlHeight.large,
};

export const DISABLED_BUTTON_STYLE: TButtonStyle = {
  color: palette.disabledText,
  background: palette.iceWhite,
  boxShadow: "none",
  border: `1px solid ${glass.border}`,
};

export const ICON_COLOR_BY_VARIANT: Record<ButtonVariantType, string> = {
  dark: palette.iceWhite,
  danger: palette.danger,
  dashed: palette.charcoal,
  neutral: palette.charcoal,
  pressed: palette.charcoal,
  primary: palette.white,
  secondary: palette.charcoal,
};

export const ICON_PADDING_BY_SIZE: Record<ButtonSizeType, TButtonStyle> = {
  compact: { paddingInlineStart: "10px", paddingInlineEnd: "14px" },
  medium: { paddingInlineStart: "10px", paddingInlineEnd: "24px" },
  large: { paddingInlineStart: "10px", paddingInlineEnd: "28px" },
};
