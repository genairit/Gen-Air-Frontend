import { theme } from "../../theme";
import { alpha } from "@mui/material";
import type { SystemStyleObject } from "@mui/system";
import type { TButtonVariant } from "./constants/button.constant";

const CHOICE_ACCENT_SOFT = alpha(theme.colors.lightPurple, 0.14);

const LIQUID_SPRING_EASING = "cubic-bezier(0.34, 1.56, 0.64, 1)";

const LIQUID_SCALE = {
  HOVER: "scale(1.03)",
  PRESS: "scale(1.06)",
} as const;

const CHOICE_COLOR_FADE_TRANSITION = ["background-color", "border-color", "color"]
  .map(property => `${property} .3s ease-in-out`)
  .join(", ");

const LIQUID_GLASS_STYLE: SystemStyleObject = {
  overflow: "hidden",
  boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.6), 0 2px 8px rgba(0, 0, 0, 0.06)",
  transition: `transform .35s ${LIQUID_SPRING_EASING}, box-shadow .25s ease, ${CHOICE_COLOR_FADE_TRANSITION}`,
  "&::after": {
    inset: 0,
    zIndex: -1,
    content: '""',
    position: "absolute",
    pointerEvents: "none",
    borderRadius: "inherit",
    background: "linear-gradient(160deg, rgba(255, 255, 255, 0.45) 0%, rgba(255, 255, 255, 0) 55%)",
  },
  "@media (hover: hover)": {
    "&:hover": {
      transform: LIQUID_SCALE.HOVER,
      boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.7), 0 6px 16px rgba(0, 0, 0, 0.1)",
    },
  },
  "&:active": {
    transform: LIQUID_SCALE.PRESS,
    boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.8), 0 8px 20px rgba(0, 0, 0, 0.12)",
  },
  "&.Mui-focusVisible": {
    outline: `2px solid ${theme.colors.lightPurple}`,
    outlineOffset: "2px",
  },
  "@media (prefers-reduced-motion: reduce)": {
    transition: CHOICE_COLOR_FADE_TRANSITION,
    "&:hover, &:active": {
      transform: "none",
    },
  },
};

const CHOICE_BASE_STYLE: SystemStyleObject = {
  ...LIQUID_GLASS_STYLE,
  fontWeight: "700",
  fontSize: "14px",
  minHeight: "48px",
  padding: "0 12px",
  borderRadius: "16px",
  fontFamily: "Rubik, sans-serif",
};

const STYLE_BY_VARIANT: Record<TButtonVariant, SystemStyleObject> = {
  primary: {
    color: "white",
    background: theme.background.brandGradient,
    "&.Mui-disabled": {
      opacity: 0.5,
      color: "white",
    },
    borderRadius: "7px",
  },
  secondary: {
    color: "black",
    border: "1px solid black",
    "&.Mui-disabled": {
      color: "#73737C",
      border: "1px solid #73737C",
    },
    borderRadius: "7px",
  },
  active: {
    ...CHOICE_BASE_STYLE,
    color: theme.colors.lightPurple,
    backgroundColor: CHOICE_ACCENT_SOFT,
    border: `1px solid ${theme.colors.lightPurple}`,

    "&:hover": {
      backgroundColor: CHOICE_ACCENT_SOFT,
      border: `1px solid ${theme.colors.lightPurple}`,
    },
  },
  outlined: {
    ...CHOICE_BASE_STYLE,
    color: theme.colors.ink,
    backgroundColor: theme.colors.white,
    border: `1px solid ${theme.border.subtle}`,

    "&:hover": {
      backgroundColor: theme.colors.white,
      border: `1px solid ${theme.border.subtle}`,
    },
  },
};

export const useStyles = () => ({
  button: ({
    variant,
    isLoading,
    showOverlay,
  }: {
    isLoading: boolean;
    showOverlay: boolean;
    variant: TButtonVariant;
  }): SystemStyleObject => ({
    position: "relative",
    pointerEvents: isLoading ? "none" : "auto",
    "&::before": showOverlay
      ? {
          content: '""',
          position: "absolute",
          inset: 0,
          borderRadius: "inherit",
          backgroundColor: "rgba(255,255,255,0.5)",
          zIndex: 1,
        }
      : {},
    ...STYLE_BY_VARIANT[variant],
  }),
});
