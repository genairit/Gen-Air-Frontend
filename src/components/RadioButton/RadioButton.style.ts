import { createStyles } from "../../create-styles";
import { theme } from "../../constants/theme.constants";
import { CENTERED_FLEX } from "../../styles/templates.style";
import type { ControlSizeType } from "../../constants/selection-control.constant";

const { palette, softShadow, radius } = theme;

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
      fontSize: 15,
      minHeight: 48,
      display: "flex",
      cursor: "pointer",
      alignItems: "center",
      width: "fit-content",
      color: palette.charcoal,
    },
    indicator: ({ size }: Pick<IIndicatorStyleOptions, "size">) => ({
      ...CENTERED_FLEX,
      flexShrink: 0,
      borderRadius: radius.pill,
      boxShadow: softShadow.inset,
      backgroundColor: palette.iceWhite,
      width: INDICATOR_SIZE_BY_CONTROL_SIZE[size],
      height: INDICATOR_SIZE_BY_CONTROL_SIZE[size],
    }),
    dot: ({ checked, size }: IIndicatorStyleOptions) => ({
      borderRadius: radius.pill,
      transition: "background-color 0.2s ease",
      width: DOT_SIZE_BY_CONTROL_SIZE[size],
      height: DOT_SIZE_BY_CONTROL_SIZE[size],
      backgroundColor: checked ? palette.primary : "transparent",
    }),
  });
