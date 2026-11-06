import type { ISegmentedSizeStyle } from "../interfaces/segmented.interface";

export const SEGMENTED_SIZES = {
  DEFAULT: "default",
  COMPACT: "compact",
} as const;

export type SegmentedSizeType = (typeof SEGMENTED_SIZES)[keyof typeof SEGMENTED_SIZES];

export const SEGMENTED_PILL_RADIUS = 9999;

export const SEGMENTED_SIZE_STYLES: Record<SegmentedSizeType, ISegmentedSizeStyle> = {
  default: {
    gap: 4,
    padding: 4,
    fontSize: 13,
    rootMinWidth: 0,
    optionHeight: 36,
    rootWidth: "100%",
    optionPaddingInline: 6,
  },
  compact: {
    gap: 4,
    padding: 4,
    fontSize: 12,
    optionHeight: 30,
    rootMinWidth: 128,
    optionPaddingInline: 12,
    rootWidth: "max-content",
  },
};

const SEGMENTED_SPRING_EASING =
  "linear(0, 0.111, 0.328, 0.545, 0.722, 0.847, 0.928, 0.974, 0.998, 1.008, 1.011, 1.01, 1.007, 1.005, 1.003, 1.002, 1.001, 1)";

export const SEGMENTED_THUMB_TRANSITION = `inset-inline-start 0.45s ${SEGMENTED_SPRING_EASING}`;
