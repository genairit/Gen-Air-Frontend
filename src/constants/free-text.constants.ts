import { TIME_UNITS } from "./date.constants";
import type { IFreeTextChipPalette } from "../interfaces/free-text.interface";

export const FREE_TEXT_MAX_LENGTH = 500;
export const FREE_TEXT_SUGGEST_LIMIT = 5;
export const FREE_TEXT_DEBOUNCE_MS = 0.3 * TIME_UNITS.SECONDS;
export const FREE_TEXT_BLUR_DELAY_MS = 0.2 * TIME_UNITS.SECONDS;

export const FREE_TEXT_KEYS = {
  SPACE: " ",
  ENTER: "Enter",
  ESCAPE: "Escape",
  ARROW_UP: "ArrowUp",
  BACKSPACE: "Backspace",
  ARROW_DOWN: "ArrowDown",
} as const;

export type TFreeTextSuggestionNavigationKeyType =
  typeof FREE_TEXT_KEYS.ARROW_UP | typeof FREE_TEXT_KEYS.ARROW_DOWN;

export const FREE_TEXT_SUGGESTION_NAVIGATION_DELTAS: Record<
  TFreeTextSuggestionNavigationKeyType,
  number
> = {
  [FREE_TEXT_KEYS.ARROW_UP]: -1,
  [FREE_TEXT_KEYS.ARROW_DOWN]: 1,
};

export const FREE_TEXT_STATUS = {
  BLOCK: "BLOCK",
  ALLOW: "ALLOW",
  UNKNOWN: "UNKNOWN",
} as const;

export type TFreeTextStatusType = (typeof FREE_TEXT_STATUS)[keyof typeof FREE_TEXT_STATUS];

export const FREE_TEXT_VALIDATION_ACTION = {
  BLOCK: "BLOCK",
  ALLOW: "ALLOW",
} as const;

export type TFreeTextValidationActionType =
  (typeof FREE_TEXT_VALIDATION_ACTION)[keyof typeof FREE_TEXT_VALIDATION_ACTION];

export const FREE_TEXT_REJECTION_REASON = {
  BLOCKED: "blocked",
  DIVERGENCE: "divergence",
} as const;

export type TFreeTextRejectionReasonType =
  (typeof FREE_TEXT_REJECTION_REASON)[keyof typeof FREE_TEXT_REJECTION_REASON];

export const FREE_TEXT_SUGGESTION_CLASS_NAMES = {
  ACTIVE: "active",
} as const;

export const FREE_TEXT_STATUS_MESSAGES: Record<TFreeTextStatusType, string | null> = {
  BLOCK: "מילים אסורות בשימוש",
  UNKNOWN: "מילים לא מוכרות זוהו",
  ALLOW: null,
};

export const FREE_TEXT_PENDING_LABEL = "בבדיקה…";
export const FREE_TEXT_LENGTH_ERROR_MESSAGE = "הטקסט ארוך מדי";
export const FREE_TEXT_DEFAULT_PLACEHOLDER = "הקלד/י מילה ולחצ/י רווח…";
export const FREE_TEXT_SUBMIT_ANYWAY_LABEL = "שלח בכל זאת (יידרש אישור ידני)";
export const FREE_TEXT_DIVERGENCE_MESSAGE_PREFIX = "מילים אלו טרם אושרו ויידרשו אישור ידני";

export const FREE_TEXT_STATUS_LABELS: Record<TFreeTextStatusType, string> = {
  ALLOW: "מאושרת",
  BLOCK: "אסורה",
  UNKNOWN: "לא ידועה",
};

export const FREE_TEXT_COLORS = {
  FOREGROUND: "#1f2430",
  NEUTRAL_BACKGROUND: "#f4f5f7",
  GREEN: "#1c7a3e",
  GREEN_LIGHT: "#e7f6ec",
  GREEN_MID: "#a8dcb9",
  RED: "#c02b2b",
  RED_LIGHT: "#fdeaea",
  RED_MID: "#f2b6b6",
  AMBER: "#9a7508",
  AMBER_LIGHT: "#fcf5e1",
  AMBER_MID: "#ecd68f",
  ACCENT: "#3b5bd9",
  ACCENT_WEAK: "#eef1fd",
  SURFACE: "#ffffff",
  BORDER: "#e2e4ea",
  MUTED: "#8a90a0",
} as const;

export const FREE_TEXT_CHIP_STYLES: Record<TFreeTextStatusType, IFreeTextChipPalette> = {
  ALLOW: {
    foreground: FREE_TEXT_COLORS.GREEN,
    background: FREE_TEXT_COLORS.GREEN_LIGHT,
    border: FREE_TEXT_COLORS.GREEN_MID,
  },
  BLOCK: {
    foreground: FREE_TEXT_COLORS.RED,
    background: FREE_TEXT_COLORS.RED_LIGHT,
    border: FREE_TEXT_COLORS.RED_MID,
  },
  UNKNOWN: {
    foreground: FREE_TEXT_COLORS.AMBER,
    background: FREE_TEXT_COLORS.AMBER_LIGHT,
    border: FREE_TEXT_COLORS.AMBER_MID,
  },
};

export const FREE_TEXT_CHIP_PENDING = {
  border: FREE_TEXT_COLORS.BORDER,
  foreground: FREE_TEXT_COLORS.FOREGROUND,
  background: FREE_TEXT_COLORS.NEUTRAL_BACKGROUND,
} as const;
