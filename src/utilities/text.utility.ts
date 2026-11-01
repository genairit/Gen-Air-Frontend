export const formatFileCount = (count: number) => `${count} קבצים`;

export const formatVisibleCount = ({ visible, total }: { visible: number; total: number }) =>
  `מציג ${visible} מתוך ${total} עובדים רשומים`;

const MAX_INITIALS = 2;

export const getInitials = (fullName: string) =>
  fullName
    .trim()
    .split(/\s+/)
    .map(word => word.charAt(0))
    .join("")
    .slice(0, MAX_INITIALS);

export const formatActiveStageCount = (count: number) => `${count} שלבים פעילים`;

export const formatTeamBadge = (count: number) => `${count} חברי צוות`;

export const formatUpdatesBadge = (count: number) => `${count} עדכונים`;

export const formatStageLabel = (stageLabel: string) => `שלב: ${stageLabel}`;

export const formatRolesBadge = (count: number) => `${count} תפקידים מוגדרים`;

export const formatErpSyncCaption = (prefix: string, syncedAt: string) => `${prefix} · ${syncedAt}`;

export const keepDigits = (value: string, maxLength: number) =>
  value.replace(/\D/g, "").slice(0, maxLength);

export const keepPhoneCharacters = (value: string, maxLength: number) =>
  value.replace(/[^\d-]/g, "").slice(0, maxLength);

export const formatFieldErrorCount = (count: number) => `יש ${count} שדות לתיקון לפני השמירה`;

export const formatTypeSwitchTitle = (typeName: string) =>
  `סוג הפרויקט שונה ל${typeName} — שום מידע לא נמחק`;

export const formatKeptFields = (labels: string) => `הועברו אוטומטית: ${labels}`;

export const formatNeededFields = (labels: string) => `שדות חדשים למילוי: ${labels}`;

export const formatHiddenFields = (labels: string) =>
  `נשמרו בצד ולא יישלחו: ${labels}. יוחזרו אם תחזור לסוג הקודם.`;
export const formatParenthesizedCount = (count: number): string => `(${count})`;
