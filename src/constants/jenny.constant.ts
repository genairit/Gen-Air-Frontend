import { theme } from "./theme.constants";
import { TIME_UNITS } from "./time.constant";
import { HTTP_STATUS } from "./api.constant";
import { duration } from "@mui/material/styles";
import type { IJennyErrorFeedback } from "../interfaces/jenny.interface";

export const JENNY_CONTEXT_TYPES = {
  PROJECT: "project",
} as const;

export type JennyContextType = (typeof JENNY_CONTEXT_TYPES)[keyof typeof JENNY_CONTEXT_TYPES];

export const JENNY_ROLES = {
  USER: "user",
  ASSISTANT: "assistant",
} as const;

export type JennyRoleType = (typeof JENNY_ROLES)[keyof typeof JENNY_ROLES];

export const JENNY_HISTORY_LIMIT = 20;

export const JENNY_MESSAGE_MAX_LENGTH = 4000;

// First document searches index PDFs and can take minutes; a finite cap still lets the user recover.
export const JENNY_CHAT_TIMEOUT_MS = 5 * 60 * TIME_UNITS.SECOND_MS;

export const JENNY_SOURCE_LINK_POLICY = {
  PROTOCOL: "https:",
  HOSTS: ["drive.google.com", "docs.google.com"],
} as const;

export const JENNY_SOURCE_NAME_CLASS = "jenny-source-name";

export const JENNY_SCROLL_PIN_THRESHOLD_PX = 80;

export const JENNY_MOTION_MS = {
  PANEL_ENTER: 0.18 * TIME_UNITS.SECOND_MS,
  PANEL_FADE_IN: 0.12 * TIME_UNITS.SECOND_MS,
  TYPING_PULSE: 1.2 * TIME_UNITS.SECOND_MS,
  TYPING_DOT_STAGGER: 0.16 * TIME_UNITS.SECOND_MS,
} as const;

const JENNY_TYPING_DOT_COUNT = 3;

export const JENNY_TYPING_DOT_DELAYS_MS = Array.from(
  { length: JENNY_TYPING_DOT_COUNT },
  (_, index) => index * JENNY_MOTION_MS.TYPING_DOT_STAGGER,
);

export const JENNY_SHEET_TRANSITION_MS = {
  STANDARD: { enter: duration.enteringScreen, exit: duration.leavingScreen },
  REDUCED_MOTION: { enter: 0, exit: 0 },
} as const;

export const JENNY_LAUNCHER_LAYOUT_PX = {
  EDGE_OFFSET: 24,
  MOBILE_EDGE_OFFSET: 16,
  GAP: 12,
} as const;

export const JENNY_LAUNCHER_CLEARANCE_PX = theme.controlHeight.large + JENNY_LAUNCHER_LAYOUT_PX.GAP;

export const JENNY_COPY = {
  TITLE: "ג׳ני",
  LAUNCHER_LABEL: "ג׳ני – עוזרת AI",
  SUBTITLE_PREFIX: "עוזרת AI · ",
  GREETING: "היי, אני ג׳ני, איך אפשר לעזור בפרויקט הזה?",
  DISCLAIMER: "ג׳ני עלולה לטעות – כדאי לבדוק במקורות",
  PLACEHOLDER: "כתבו שאלה על הפרויקט…",
  INPUT_LABEL: "הודעה לג׳ני",
  SEND: "שליחה",
  THINKING: "ג׳ני חושבת…",
  RETRY: "נסו שוב",
  SOURCES: "מקורות",
  SOURCE_PAGE_PREFIX: "עמ׳ ",
  SOURCE_SPOKEN_PAGE_PREFIX: "עמוד ",
  SOURCE_OPENS_IN_DRIVE: "נפתח ב-Drive בכרטיסייה חדשה",
  NEW_CHAT: "שיחה חדשה",
  CLOSE: "סגירה",
  THREAD_LABEL: "שיחה עם ג׳ני",
  ASSISTANT_PREFIX: "ג׳ני: ",
  USER_PREFIX: "ההודעה שלך: ",
  ANSWER_ANNOUNCEMENT_PREFIX: "ג׳ני ענתה: ",
} as const;

export const JENNY_SENDER_PREFIX: Record<JennyRoleType, string> = {
  [JENNY_ROLES.USER]: JENNY_COPY.USER_PREFIX,
  [JENNY_ROLES.ASSISTANT]: JENNY_COPY.ASSISTANT_PREFIX,
};

export const JENNY_GENERIC_ERROR: IJennyErrorFeedback = {
  canRetry: true,
  message: "לא הצלחתי לקבל תשובה. נסו שוב.",
};

const JENNY_PERMISSION_ERROR: IJennyErrorFeedback = {
  canRetry: false,
  message: "אין לך הרשאה לשאול את ג׳ני על הפרויקט הזה.",
};

export const JENNY_ERROR_BY_STATUS: Partial<Record<number, IJennyErrorFeedback>> = {
  [HTTP_STATUS.BAD_REQUEST]: {
    canRetry: false,
    message: "לא ניתן לשלוח את השאלה במבנה הזה. נסו לנסח אותה מחדש.",
  },
  [HTTP_STATUS.UNAUTHORIZED]: JENNY_PERMISSION_ERROR,
  [HTTP_STATUS.FORBIDDEN]: JENNY_PERMISSION_ERROR,
  [HTTP_STATUS.NOT_FOUND]: {
    canRetry: false,
    message: "הפרויקט לא נמצא, ולכן ג׳ני לא יכולה לענות עליו.",
  },
  [HTTP_STATUS.TOO_MANY_REQUESTS]: {
    canRetry: true,
    message: "נשלחו יותר מדי שאלות בזמן קצר. נסו שוב בעוד רגע.",
  },
  [HTTP_STATUS.BAD_GATEWAY]: JENNY_GENERIC_ERROR,
  [HTTP_STATUS.GATEWAY_TIMEOUT]: {
    canRetry: true,
    message: "ג׳ני לא הספיקה לענות בזמן. נסו שוב או נסחו שאלה ממוקדת יותר.",
  },
  [HTTP_STATUS.SERVICE_UNAVAILABLE]: {
    canRetry: false,
    message: "ג׳ני אינה זמינה כרגע. נסו שוב מאוחר יותר.",
  },
};
