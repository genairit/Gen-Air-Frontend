import { HTTP_STATUS } from "./api.constant";
import { TIME_UNITS } from "./date.constants";

export const FOLDER_CONTENT_STATUSES = {
  EMPTY: "empty",
  UNKNOWN: "unknown",
  HAS_CONTENT: "has_content",
} as const;

export type FolderContentStatusType =
  (typeof FOLDER_CONTENT_STATUSES)[keyof typeof FOLDER_CONTENT_STATUSES];

export const FOLDER_CONTENT_STATUS_VALUES: FolderContentStatusType[] =
  Object.values(FOLDER_CONTENT_STATUSES);

export const DRIVE_STATUS_BADGE_STATES = {
  ...FOLDER_CONTENT_STATUSES,
  LOADING: "loading",
} as const;

export type DriveStatusBadgeStateType =
  (typeof DRIVE_STATUS_BADGE_STATES)[keyof typeof DRIVE_STATUS_BADGE_STATES];

export const DRIVE_STATUS_BADGE_SIZES = {
  CARD: 20,
  SUBFOLDER: 20,
  ACCORDION: 22,
} as const;

export const DRIVE_STATUS_LABELS: Record<DriveStatusBadgeStateType, string> = {
  empty: "התיקייה ריקה",
  loading: "בודק תוכן…",
  unknown: "לא ניתן לבדוק",
  has_content: "יש קבצים בתיקייה",
};

export const DRIVE_FOLDER_COPY = {
  EMPTY: "ריקה",
  OPEN_FOLDER: "פתח תיקייה ב-Drive",
  PREPARE_FOLDER: "צור תיקיית פרויקט",
  PREPARING_FOLDER: "מכין את תיקיית הפרויקט…",
  MISSING_FOLDER_TITLE: "תיקיית הפרויקט עדיין לא נוצרה",
  MISSING_FOLDER_LINE: "אפשר לנסות שוב ליצור את התיקייה ואת תיקיות התבנית.",
  MISSING_FOLDER_READ_ONLY: "פנו למנהל הפרויקט כדי ליצור את התיקייה.",
  PROVISION_FAILED: "לא ניתן ליצור את התיקייה כרגע. בדקו את החיבור ל-Google Drive ונסו שוב.",
  AUTHENTICATION_FAILED: "החיבור ל-Google Drive אינו מוגדר כראוי. פנו למנהל המערכת.",
  UNKNOWN: "—",
  RETRY: "נסה שוב",
  CHECKING: "בודק…",
  NO_FILES: "אין קבצים בתיקייה",
  UNAVAILABLE_TITLE: "Google Drive אינו זמין כרגע",
  UNAVAILABLE_LINE: "לא ניתן לדעת אילו תיקיות מכילות קבצים",
  NESTED_EMPTY: "אין קבצים בתיקייה ובתתי-התיקיות שלה — התיקייה נחשבת ריקה",
} as const;

export const DRIVE_UNAVAILABLE_STATUSES: number[] = [
  HTTP_STATUS.BAD_GATEWAY,
  HTTP_STATUS.SERVICE_UNAVAILABLE,
];

export const DRIVE_STATUS_SPINNER_ROTATION_MS = 0.9 * TIME_UNITS.SECONDS;

export const DRIVE_ERROR_CODES = {
  AUTHENTICATION_FAILED: "DRIVE_AUTHENTICATION_FAILED",
} as const;

export const GOOGLE_DRIVE_FOLDER_URL = "https://drive.google.com/drive/folders/";
