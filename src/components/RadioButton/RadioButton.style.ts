import { createStyles } from "../../create-styles";
import { theme } from "../../constants/theme.constants";
import { CENTERED_FLEX } from "../../styles/templates.style";
import type { ControlSizeType } from "../../constants/selection-control.constant";

const { palette, glass, radius } = theme;

const INDICATOR_SIZE_BY_CONTROL_SIZE: Record<ControlSizeType, number> = {
  small: 24,
  medium: 28,
};

const DOT_SIZE_BY_CONTROL_SIZE: Record<ControlSizeType, number> = {
  small: 10,
  medium: 12,
};

interface IIndicatorStyleOptions {
  checked: boolean;
  size: ControlSizeType;
}

export const useStyles = () =>
  createStyles({
    container: {
      gap: "12px",
      border: 0,
      padding: 0,
      fontSize: 15,
      minHeight: 48,
      display: "flex",
      position: "relative",
      cursor: "pointer",
      alignItems: "center",
      width: "fit-content",
      color: palette.charcoal,
      backgroundColor: "transparent",
      "&:has(input:focus-visible)": {
        outline: `2px solid ${palette.primary}`,
        outlineOffset: 3,
      },
      "&:focus-visible": { outline: `2px solid ${palette.primary}`, outlineOffset: 3 },
    },
    input: {
      margin: 0,
      width: 1,
      height: 1,
      opacity: 0,
      position: "absolute",
    },
    indicator: ({ size }: Pick<IIndicatorStyleOptions, "size">) => ({
      ...CENTERED_FLEX,
      flexShrink: 0,
      borderRadius: radius.pill,
      border: `1.5px solid ${glass.border}`,
      backgroundColor: palette.white,
      width: INDICATOR_SIZE_BY_CONTROL_SIZE[size],
      height: INDICATOR_SIZE_BY_CONTROL_SIZE[size],
    }),
    dot: ({ checked, size }: IIndicatorStyleOptions) => ({
      borderRadius: radius.pill,
      transition: "background-color 0.2s ease",
      width: DOT_SIZE_BY_CONTROL_SIZE[size],
      height: DOT_SIZE_BY_CONTROL_SIZE[size],
      backgroundColor: checked ? palette.primary : "transparent",
      "@media (prefers-reduced-motion: reduce)": { transition: "none" },
    }),
  });
