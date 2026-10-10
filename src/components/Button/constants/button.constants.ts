import type { Theme } from "@mui/material";
import type { SystemStyleObject } from "@mui/system";
import { theme } from "../../../constants/theme.constants";

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

const { palette, softShadow, controlHeight } = theme;

export const STYLE_BY_VARIANT: Record<ButtonVariantType, TButtonStyle> = {
  primary: {
    fontWeight: 700,
    color: palette.white,
    boxShadow: softShadow.primary,
    backgroundColor: palette.primary,
    "&:hover": { backgroundColor: palette.primaryHover },
    "&:active": { boxShadow: softShadow.primaryPressed },
  },
  secondary: {
    color: palette.charcoal,
    backgroundColor: palette.airBlue,
    boxShadow: softShadow.raisedMedium,
    "&:hover": { backgroundColor: palette.airBlue },
    "&:active": { boxShadow: softShadow.inset },
  },
  neutral: {
    color: palette.charcoal,
    backgroundColor: palette.iceWhite,
    boxShadow: softShadow.raisedMedium,
    "&:hover": { backgroundColor: palette.iceWhite },
    "&:active": { boxShadow: softShadow.inset },
  },
  pressed: {
    color: palette.charcoal,
    boxShadow: softShadow.inset,
    backgroundColor: palette.iceWhite,
    "&:hover": { backgroundColor: palette.iceWhite },
  },
  danger: {
    color: palette.danger,
    backgroundColor: "transparent",
    "&:hover": { backgroundColor: palette.dangerSurface },
  },
  dark: {
    color: palette.iceWhite,
    boxShadow: softShadow.raisedDark,
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
  border: "none",
  color: palette.disabledText,
  backgroundColor: palette.iceWhite,
  boxShadow: softShadow.insetDisabled,
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
