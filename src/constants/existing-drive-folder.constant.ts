import { DRIVE_ERROR_CODES } from "./drive-folder.constant";

export const DRIVE_FOLDER_LINK_LIMITS = { MAX_REFERENCE_LENGTH: 2048 } as const;

export const DRIVE_FOLDER_MODES = {
  NEW: "new",
  EXISTING: "existing",
} as const;

export type DriveFolderModeType = (typeof DRIVE_FOLDER_MODES)[keyof typeof DRIVE_FOLDER_MODES];

export const EXISTING_DRIVE_FOLDER_COPY = {
  LINKED: "תיקייה קיימת מקושרת",
  TITLE: "תיקיית Google Drive",
  NEW: "יצירת תיקייה חדשה",
  EXISTING: "קישור לתיקייה קיימת",
  INPUT: "קישור או מזהה תיקיית Google Drive",
  PLACEHOLDER: "https://drive.google.com/drive/folders/…",
  DEFAULT_HINT: "תיקייה חדשה עם מבנה התיקיות הרגיל תיווצר עבור הפרויקט.",
  EXISTING_HINT: "התיקייה ותוכנה יישמרו. תיקיות חסרות יתווספו רק בפעולה מפורשת לאחר יצירת הפרויקט.",
  APARTMENT_HINT: "תיקיית דירה קיימת צריכה להיות בתוך תיקיית דיירים של הבניין.",
  CHECKING: "בודק את התיקייה והגישה אליה…",
  CHECKED: "התיקייה נבדקה ותקושר לפרויקט",
  RETRY: "נסה לבדוק שוב",
  OPEN: "פתח את התיקייה בטאב חדש",
  COMPLETE: "השלם תיקיות חסרות",
  COMPLETING: "משלים תיקיות חסרות…",
  MISSING_TITLE: "מבנה התיקיות אינו מלא",
  MISSING_HINT: "התיקייה הקיימת נשמרת ללא שינוי. אפשר להוסיף את התיקיות החסרות בלבד.",
  MISSING_READ_ONLY: "יש לפנות למשתמש המורשה לעדכן פרויקטים כדי להשלים את התיקיות.",
} as const;

export const DRIVE_FOLDER_LINK_ERROR_CODES = {
  INVALID_REFERENCE: "DRIVE_FOLDER_REFERENCE_INVALID",
  NOT_FOUND: "DRIVE_FOLDER_NOT_ACCESSIBLE",
  NOT_FOLDER: "DRIVE_FOLDER_REQUIRED",
  OUTSIDE_ROOT: "DRIVE_FOLDER_OUTSIDE_COMPANY",
  ALREADY_LINKED: "DRIVE_FOLDER_ALREADY_LINKED",
  OVERLAP: "DRIVE_FOLDER_OWNERSHIP_OVERLAP",
  APARTMENT_LOCATION: "DRIVE_FOLDER_APARTMENT_LOCATION_INVALID",
  AMBIGUOUS_TEMPLATE: "DRIVE_FOLDER_TEMPLATE_AMBIGUOUS",
  NOT_CONFIGURED: "DRIVE_FOLDER_LINK_NOT_CONFIGURED",
  AUTHENTICATION_FAILED: DRIVE_ERROR_CODES.AUTHENTICATION_FAILED,
  UNAVAILABLE: "DRIVE_FOLDER_CHECK_FAILED",
} as const;

export const DRIVE_FOLDER_LINK_ERROR_COPY = {
  INVALID_REFERENCE: "יש להזין קישור לתיקיית Google Drive או מזהה תיקייה תקין.",
  NOT_FOUND:
    "התיקייה לא נמצאה, נמצאת באשפה או שאין למערכת גישה אליה. בדוק את הקישור והרשאות השיתוף.",
  NOT_FOLDER: "הקישור מפנה לקובץ. יש לבחור תיקייה.",
  OUTSIDE_ROOT: "יש לבחור תיקייה מתוך תיקיית הפרויקטים של GenAir.",
  ALREADY_LINKED: "התיקייה כבר מקושרת לפרויקט אחר. יש לבחור תיקייה אחרת.",
  OVERLAP: "התיקייה חופפת לתיקיית פרויקט קיים. יש לבחור תיקייה נפרדת.",
  APARTMENT_LOCATION: "תיקיית דירה קיימת חייבת להיות בתוך תיקיית דיירים של הבניין הנבחר.",
  AMBIGUOUS_TEMPLATE: "נמצאו תיקיות כפולות באותו שם. יש להסדיר את הכפילויות ב־Drive ולנסות שוב.",
  NOT_CONFIGURED: "חיבור Google Drive אינו מוגדר במערכת. יש לפנות למנהל המערכת.",
  AUTHENTICATION_FAILED: "אימות הגישה ל־Google Drive נכשל. יש לפנות למנהל המערכת לבדיקה.",
  UNAVAILABLE: "לא ניתן לבדוק את התיקייה כרגע. נסה שוב בעוד רגע.",
  UNAUTHORIZED: "אין הרשאה לבצע פעולה זו. בדוק את הרשאות החשבון.",
} as const;

export const DRIVE_FOLDER_LINK_ERROR_MESSAGES: Record<string, string> = {
  [DRIVE_FOLDER_LINK_ERROR_CODES.INVALID_REFERENCE]: DRIVE_FOLDER_LINK_ERROR_COPY.INVALID_REFERENCE,
  [DRIVE_FOLDER_LINK_ERROR_CODES.NOT_FOUND]: DRIVE_FOLDER_LINK_ERROR_COPY.NOT_FOUND,
  [DRIVE_FOLDER_LINK_ERROR_CODES.NOT_FOLDER]: DRIVE_FOLDER_LINK_ERROR_COPY.NOT_FOLDER,
  [DRIVE_FOLDER_LINK_ERROR_CODES.OUTSIDE_ROOT]: DRIVE_FOLDER_LINK_ERROR_COPY.OUTSIDE_ROOT,
  [DRIVE_FOLDER_LINK_ERROR_CODES.ALREADY_LINKED]: DRIVE_FOLDER_LINK_ERROR_COPY.ALREADY_LINKED,
  [DRIVE_FOLDER_LINK_ERROR_CODES.OVERLAP]: DRIVE_FOLDER_LINK_ERROR_COPY.OVERLAP,
  [DRIVE_FOLDER_LINK_ERROR_CODES.APARTMENT_LOCATION]:
    DRIVE_FOLDER_LINK_ERROR_COPY.APARTMENT_LOCATION,
  [DRIVE_FOLDER_LINK_ERROR_CODES.AMBIGUOUS_TEMPLATE]:
    DRIVE_FOLDER_LINK_ERROR_COPY.AMBIGUOUS_TEMPLATE,
  [DRIVE_FOLDER_LINK_ERROR_CODES.NOT_CONFIGURED]: DRIVE_FOLDER_LINK_ERROR_COPY.NOT_CONFIGURED,
  [DRIVE_FOLDER_LINK_ERROR_CODES.AUTHENTICATION_FAILED]:
    DRIVE_FOLDER_LINK_ERROR_COPY.AUTHENTICATION_FAILED,
  [DRIVE_FOLDER_LINK_ERROR_CODES.UNAVAILABLE]: DRIVE_FOLDER_LINK_ERROR_COPY.UNAVAILABLE,
};
