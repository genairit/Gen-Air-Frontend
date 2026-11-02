import {
  SEGMENTED_PILL_RADIUS,
  SEGMENTED_SIZE_STYLES,
  SEGMENTED_THUMB_TRANSITION,
} from "../../constants/segmented.constant";

import type {
  ISegmentedRootStyleParams,
  ISegmentedThumbStyleParams,
  ISegmentedTrackStyleParams,
  ISegmentedOptionStyleParams,
} from "../../interfaces/segmented.interface";

import { theme } from "../../theme";
import { createStyles } from "../../create-styles";
import { getSegmentedThumbGeometry } from "../../utilities/segmented.utility";

export const useStyles = () =>
  createStyles({
    root: ({ size, disabled }: ISegmentedRootStyleParams) => ({
      display: "flex",
      boxSizing: "border-box",
      opacity: disabled ? 0.5 : 1,
      boxShadow: theme.shadow.default,
      backgroundColor: theme.colors.white,
      borderRadius: SEGMENTED_PILL_RADIUS,
      width: SEGMENTED_SIZE_STYLES[size].rootWidth,
      border: `1px solid ${theme.border.segmented}`,
      padding: `${SEGMENTED_SIZE_STYLES[size].padding}px`,
      minWidth: `${SEGMENTED_SIZE_STYLES[size].rootMinWidth}px`,
    }),
    track: ({ size }: ISegmentedTrackStyleParams) => ({
      flex: 1,
      display: "grid",
      position: "relative",
      gridAutoFlow: "column",
      gridAutoColumns: "1fr",
      gap: `${SEGMENTED_SIZE_STYLES[size].gap}px`,
    }),
    thumb: ({ optionsCount, selectedIndex, size }: ISegmentedThumbStyleParams) => ({
      top: 0,
      bottom: 0,
      position: "absolute",
      pointerEvents: "none",
      borderRadius: SEGMENTED_PILL_RADIUS,
      transition: SEGMENTED_THUMB_TRANSITION,
      boxShadow: theme.shadow.default,
      background: theme.background.brandGradient,
      ...getSegmentedThumbGeometry({
        optionsCount,
        selectedIndex,
        gap: SEGMENTED_SIZE_STYLES[size].gap,
      }),
      "@media (prefers-reduced-motion: reduce)": { transition: "none" },
    }),
    option: ({ isSelected, size }: ISegmentedOptionStyleParams) => ({
      zIndex: 1,
      minWidth: 0,
      outline: "none",
      fontWeight: 700,
      whiteSpace: "nowrap",
      transition: "color 0.18s ease",
      borderRadius: SEGMENTED_PILL_RADIUS,
      WebkitTapHighlightColor: "transparent",
      fontSize: SEGMENTED_SIZE_STYLES[size].fontSize,
      minHeight: `${SEGMENTED_SIZE_STYLES[size].optionHeight}px`,
      paddingInline: `${SEGMENTED_SIZE_STYLES[size].optionPaddingInline}px`,
      color: isSelected ? theme.colors.white : theme.text.segmentedInactive,
      "@media (prefers-reduced-motion: reduce)": { transition: "none" },
      "&.Mui-focusVisible": {
        outlineOffset: -3,
        outline: "2px solid currentColor",
      },
    }),
  });
