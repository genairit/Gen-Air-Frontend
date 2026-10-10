import { createStyles } from "../../create-styles";
import { theme } from "../../constants/theme.constants";
import { CENTERED_FLEX } from "../../styles/templates.style";
import type { CheckBoxShapeType } from "../../constants/selection-control.constant";

const { palette, softShadow, radius } = theme;

const RADIUS_BY_SHAPE: Record<CheckBoxShapeType, string> = {
  square: radius.checkbox,
  circle: radius.pill,
};

const SIZE_BY_SHAPE: Record<CheckBoxShapeType, number> = {
  square: 28,
  circle: 26,
};

interface ICheckBoxStyleOptions {
  checked: boolean;
  shape: CheckBoxShapeType;
}

export const useStyles = () =>
  createStyles({
    container: ({ disabled, textColor }: { disabled: boolean; textColor: string }) => ({
      gap: "12px",
      fontSize: 15,
      minHeight: 48,
      display: "flex",
      color: textColor,
      alignItems: "center",
      width: "fit-content",
      opacity: disabled ? 0.5 : 1,
      flexDirection: "row" as const,
      WebkitTapHighlightColor: "transparent",
      cursor: disabled ? "default" : "pointer",
    }),
    checkBox: ({ checked, shape }: ICheckBoxStyleOptions) => ({
      ...CENTERED_FLEX,
      flexShrink: 0,
      color: palette.white,
      width: SIZE_BY_SHAPE[shape],
      height: SIZE_BY_SHAPE[shape],
      borderRadius: RADIUS_BY_SHAPE[shape],
      transition: "background-color 0.2s ease",
      backgroundColor: checked ? palette.orange : palette.iceWhite,
      boxShadow: checked ? softShadow.primaryPressed : softShadow.inset,
    }),
    checkIcon: {
      fontSize: 18,
    },
  });
