import {
  BUTTON_SHAPES,
  STYLE_BY_SIZE,
  STYLE_BY_VARIANT,
  type ButtonSizeType,
  CIRCLE_WIDTH_BY_SIZE,
  type ButtonShapeType,
  ICON_PADDING_BY_SIZE,
  DISABLED_BUTTON_STYLE,
  type ButtonVariantType,
} from "./constants/button.constants";

import type { Theme } from "@mui/material";
import type { CSSProperties } from "react";
import type { SystemStyleObject } from "@mui/system";
import { theme } from "../../constants/theme.constants";

interface IButtonStyleOptions {
  hasIcon: boolean;
  isLoading: boolean;
  size: ButtonSizeType;
  shape: ButtonShapeType;
  variant: ButtonVariantType;
}

const LOADING_OVERLAY_STYLE: SystemStyleObject<Theme> = {
  "&::before": {
    zIndex: 1,
    inset: 0,
    content: '""',
    position: "absolute",
    backgroundColor: "rgba(255,255,255,0.5)",
  },
};

const getShapeStyle = ({
  size,
  shape,
  hasIcon,
}: Pick<IButtonStyleOptions, "size" | "shape" | "hasIcon">): SystemStyleObject<Theme> => {
  if (shape !== BUTTON_SHAPES.CIRCLE) {
    return hasIcon ? ICON_PADDING_BY_SIZE[size] : {};
  }

  const diameter = CIRCLE_WIDTH_BY_SIZE[size];

  return { padding: 0, width: diameter, minWidth: diameter, fontSize: 18 };
};

export const useStyles = () => ({
  button: ({
    size,
    shape,
    variant,
    hasIcon,
    isLoading,
  }: IButtonStyleOptions): SystemStyleObject<Theme> => ({
    fontWeight: 600,
    flexShrink: 0,
    position: "relative",
    textTransform: "none",
    whiteSpace: "nowrap",
    borderRadius: theme.radius.pill,
    pointerEvents: isLoading ? "none" : "auto",
    transition: "box-shadow 0.2s ease, background-color 0.2s ease",
    ...STYLE_BY_SIZE[size],
    ...STYLE_BY_VARIANT[variant],
    ...getShapeStyle({ shape, size, hasIcon }),
    ...(isLoading ? LOADING_OVERLAY_STYLE : {}),
    "&.Mui-disabled": DISABLED_BUTTON_STYLE,
  }),
  text: {
    visibility: "hidden",
  } as CSSProperties,
  loadingAnimation: {
    width: 90,
    zIndex: 2,
    height: 90,
    top: "50%",
    left: "50%",
    position: "absolute",
    transform: "translate(-50%, -50%)",
  } as CSSProperties,
});
