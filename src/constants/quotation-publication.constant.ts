import { TIME_UNITS } from "./time.constant";

export const PUBLICATION_STATE = {
  UNTRACKED: "untracked",
  NOT_APPLICABLE: "not_applicable",
  QUEUED: "queued",
  RENDERING: "rendering",
  PUBLISHING: "publishing",
  ARCHIVING: "archiving",
  RECONCILING: "reconciling",
  PUBLISHED: "published",
  ARCHIVED: "archived",
  FAILED: "failed",
} as const;
export type PublicationStateType = (typeof PUBLICATION_STATE)[keyof typeof PUBLICATION_STATE];
export const PUBLICATION_KIND = { QUOTATION: "quotation", ORDER: "order" } as const;
export type PublicationKindType = (typeof PUBLICATION_KIND)[keyof typeof PUBLICATION_KIND];
export const PUBLICATION_LABELS: Record<PublicationStateType, string> = {
  untracked: "הקובץ יישמר ב-Drive לאחר שליחה לבדיקה",
  not_applicable: "אין פרויקט מקושר לשמירת הקובץ ב-Drive",
  queued: "הקובץ ממתין להפקה",
  rendering: "מפיק PDF",
  publishing: "שומר את הקובץ ב-Drive",
  archiving: "מעביר את הקובץ לארכיון",
  reconciling: "בודק את שמירת הקובץ ב-Drive",
  published: "הקובץ נשמר ב-Drive",
  archived: "הקובץ הועבר לארכיון",
  failed: "שמירת הקובץ ב-Drive נכשלה",
};
export const PUBLICATION_KIND_LABELS = { quotation: "הצעת מחיר", order: "הזמנה" } as const;
export const PUBLICATION_COPY = {
  RETRY: "ניסיון נוסף",
  REFRESH: "רענון מצב הקובץ",
  OPEN: "פתיחת הקובץ (בחלון חדש)",
  HISTORY_OPEN: "פתיחת קובץ המחזור — הגרסה הנוכחית (בחלון חדש)",
  READ_ERROR: "לא ניתן לטעון את מצב שמירת הקובץ ב-Drive",
  RETRY_ERROR: "לא ניתן לחדש את שמירת הקובץ. רעננו את המסמך ונסו שוב.",
} as const;
export const PUBLICATION_POLL = {
  INTERVAL_MS: 3 * TIME_UNITS.SECOND_MS,
  RECOVERY_INTERVAL_MS: 10 * TIME_UNITS.SECOND_MS,
} as const;
export const publicationQueryKey = (
  id: string,
  version: number,
  generation: number,
): readonly [string, string, number, number] => ["quotation-publication", id, version, generation];

const PUBLICATION_DRIVE_URL_PARTS = {
  ORIGIN: "https://drive[.]google[.]com",
  FILE_ID: "[a-zA-Z0-9_-]+",
} as const;
export const PUBLICATION_DRIVE_URL_PATTERNS = {
  FILE: new RegExp(
    `^${PUBLICATION_DRIVE_URL_PARTS.ORIGIN}/file/d/${PUBLICATION_DRIVE_URL_PARTS.FILE_ID}/view(?:[?][a-zA-Z0-9._~!$&()*+,;=:@%/?-]*)?$`,
  ),
  OPEN: new RegExp(
    `^${PUBLICATION_DRIVE_URL_PARTS.ORIGIN}/open[?]id=${PUBLICATION_DRIVE_URL_PARTS.FILE_ID}$`,
  ),
} as const;
