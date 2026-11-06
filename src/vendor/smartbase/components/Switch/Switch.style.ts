import {
  getThumbWidth,
  getThumbTransition,
  getThumbInlineStart,
} from "../../utilities/switch.utility";

import {
  SWITCH_THUMB_GAP,
  SWITCH_THUMB_SIZE,
  SWITCH_TRACK_WIDTH,
  SWITCH_TRACK_HEIGHT,
  SWITCH_TRANSITION_DURATION,
} from "../../constants/switch.constant";

import type {
  ISwitchStyleOptions,
  ISwitchTrackStyleOptions,
} from "../../interfaces/switch.interface";

import { theme } from "../../theme";
import { createStyles } from "../../create-styles";

export const useStyles = () =>
  createStyles({
    track: (options: ISwitchTrackStyleOptions) => ({
      padding: 0,
      flexShrink: 0,
      position: "relative",
      touchAction: "pan-y",
      width: SWITCH_TRACK_WIDTH,
      height: SWITCH_TRACK_HEIGHT,
      opacity: options.disabled ? 0.5 : 1,
      backgroundColor: theme.border.natural,
      borderRadius: `${SWITCH_TRACK_HEIGHT / 2}px`,
      cursor: options.disabled ? "default" : "pointer",
      "& input": {
        touchAction: "pan-y !important",
        pointerEvents: options.disabled ? "none" : "auto",
      },
      "&::before": {
        inset: 0,
        content: '""',
        position: "absolute",
        borderRadius: "inherit",
        opacity: options.progress,
        background: theme.background.purpleGradient,
        transition: options.isDragging ? "none" : `opacity ${SWITCH_TRANSITION_DURATION} ease`,
      },
      "@media (prefers-reduced-motion: reduce)": { "&::before": { transition: "none" } },
    }),
    thumb: (options: ISwitchStyleOptions) => ({
      zIndex: 1,
      position: "absolute",
      top: SWITCH_THUMB_GAP,
      height: SWITCH_THUMB_SIZE,
      backgroundColor: theme.colors.white,
      width: getThumbWidth(options.isPressed),
      transition: getThumbTransition(options),
      borderRadius: `${SWITCH_THUMB_SIZE / 2}px`,
      boxShadow: `0 1px 3px ${theme.shadow.dark}`,
      insetInlineStart: getThumbInlineStart(options),
      "@media (prefers-reduced-motion: reduce)": { transition: "none" },
    }),
  });
