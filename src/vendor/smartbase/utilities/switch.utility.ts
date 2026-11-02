import {
  SWITCH_THUMB_GAP,
  SWITCH_THUMB_SIZE,
  SWITCH_TRACK_WIDTH,
  SWITCH_THUMB_TRAVEL,
  SWITCH_SPRING_EASING,
  SWITCH_THUMB_STRETCH,
  SWITCH_STRETCH_DURATION,
  SWITCH_TRANSITION_DURATION,
} from "../constants/switch.constant";

import type { ISwitchStyleOptions } from "../interfaces/switch.interface";

export const getThumbWidth = (isPressed: boolean): number =>
  isPressed ? SWITCH_THUMB_SIZE + SWITCH_THUMB_STRETCH : SWITCH_THUMB_SIZE;

export const getThumbInlineStart = (options: ISwitchStyleOptions): number => {
  const stretchesBackwards = options.isPressed && options.checked;
  const stretchOffset = stretchesBackwards ? -SWITCH_THUMB_STRETCH : 0;
  const furthestStart = SWITCH_TRACK_WIDTH - SWITCH_THUMB_GAP - getThumbWidth(options.isPressed);

  const naturalStart = SWITCH_THUMB_GAP + options.progress * SWITCH_THUMB_TRAVEL + stretchOffset;

  return Math.min(Math.max(naturalStart, SWITCH_THUMB_GAP), furthestStart);
};

export const getThumbTransition = (options: ISwitchStyleOptions): string => {
  const widthTransition = `width ${SWITCH_STRETCH_DURATION} ${SWITCH_SPRING_EASING}`;

  if (options.isDragging) {
    return widthTransition;
  }

  return `${widthTransition}, inset-inline-start ${SWITCH_TRANSITION_DURATION} ${SWITCH_SPRING_EASING}`;
};
