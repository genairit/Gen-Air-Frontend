export const PROGRESS_BAR_SIZES = {
  SMALL: "sm",
  MEDIUM: "md",
} as const;

export type ProgressBarSizeType = (typeof PROGRESS_BAR_SIZES)[keyof typeof PROGRESS_BAR_SIZES];

interface IProgressBarDimensions {
  gap: number;
  fontSize: number;
  trackHeight: number;
}

export const PERCENTAGE_MAX = 100;

export const FULLY_ROUNDED_RADIUS = 999;

export const PROGRESS_BAR_DIMENSIONS: Record<ProgressBarSizeType, IProgressBarDimensions> = {
  [PROGRESS_BAR_SIZES.SMALL]: { gap: 10, fontSize: 12, trackHeight: 10 },
  [PROGRESS_BAR_SIZES.MEDIUM]: { gap: 12, fontSize: 14, trackHeight: 16 },
};

const PROGRESS_BAR_FILL_DURATION_MS = 400;

export const PROGRESS_BAR_FILL_TRANSITION = `width ${PROGRESS_BAR_FILL_DURATION_MS}ms cubic-bezier(0.2, 0.8, 0.2, 1)`;
