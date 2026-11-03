export const SHARED_DOCUMENT_STATUS = {
  NONE: "none",
  AVAILABLE: "available",
  UNAVAILABLE: "unavailable",
} as const;

export type SharedDocumentStatusType =
  (typeof SHARED_DOCUMENT_STATUS)[keyof typeof SHARED_DOCUMENT_STATUS];

export const SHARED_DOCUMENT_COPY = {
  PARENT_TITLE: "מסמך משותף לדירות",
  PARENT_EMPTY: "בחרו קובץ מהרשימה כדי להציג אותו בכל הדירות.",
  PARENT_UNAVAILABLE: "הקובץ שנבחר אינו זמין. בחרו קובץ אחר או נקו את הבחירה.",
  SELECT: "הגדר כמסמך משותף",
  SELECTED: "משותף לדירות",
  CLEAR: "נקה בחירה",
  CHILD_TITLE: "מסמך משותף מפרויקט האב",
  CHILD_EMPTY: "טרם נבחר מסמך משותף בפרויקט האב.",
  CHILD_UNAVAILABLE: "המסמך המשותף אינו זמין ב-Drive. פנו לעורך פרויקט האב לבחירת קובץ אחר.",
  OPEN: "פתח מסמך משותף ב-Drive",
  ERROR: "לא ניתן לעדכן את המסמך המשותף. נסו שוב.",
} as const;
