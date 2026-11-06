import { clamp } from "./number.utility";
import { PERCENTAGE_MAX } from "../components/ProgressBar/constants/progress-bar.constant";

export interface IProgress {
  step: number;
  total: number;
  percentage: number;
}

export interface IProgressOptions {
  value: number;
  total: number;
}

export const getProgress = ({ value, total }: IProgressOptions): IProgress => {
  const stepsCount = Math.max(0, total);
  const step = clamp({ value, min: 0, max: stepsCount });

  if (stepsCount === 0) {
    return { step, total: stepsCount, percentage: 0 };
  }

  return { step, total: stepsCount, percentage: (step / stepsCount) * PERCENTAGE_MAX };
};

export const getProgressStepLabel = ({ step, total }: IProgress): string =>
  `שלב ${step} מתוך ${total}`;
