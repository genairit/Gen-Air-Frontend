export const QUOTATION_PROJECT_KIND = {
  PROJECT: "project",
  BUILDING: "building",
  APARTMENT: "apartment",
} as const;

export type TQuotationProjectKind =
  (typeof QUOTATION_PROJECT_KIND)[keyof typeof QUOTATION_PROJECT_KIND];

export const QUOTATION_PROJECT_ROLE = {
  PRIMARY: "primary",
  SHARED: "shared",
} as const;

export type TQuotationProjectRole =
  (typeof QUOTATION_PROJECT_ROLE)[keyof typeof QUOTATION_PROJECT_ROLE];

export const QUOTATION_SHARING_ANCHOR = {
  CARD_ID: "apartment-sharing",
  HEADING_ID: "apartment-sharing-heading",
  CAPTION_ID: "apartment-sharing-caption",
} as const;

const PROJECT_QUOTATIONS_ROOT = "project-quotations";

export const QUOTATION_SHARING_KEYS = {
  PROJECT_QUOTATIONS_ROOT,
  apartmentOptions: (quotationId: string) => ["quotation-apartment-options", quotationId],
  projectQuotations: (projectId: string) => [PROJECT_QUOTATIONS_ROOT, projectId],
} as const;

export const QUOTATION_SHARING_LAYOUT = {
  ROW_HEIGHT: 48,
  LIST_MAX_HEIGHT: 360,
  APARTMENT_PREVIEW_COUNT: 3,
  PROJECT_PAGE_SIZE: 20,
} as const;

export const QUOTATION_SHARING_COPY = {
  TITLE: "שיתוף עם דירות",
  SWITCH: "הצגת ההצעה גם בדירות נבחרות",
  SEARCH_TITLE: "חיפוש דירות",
  SEARCH_PLACEHOLDER: "חיפוש לפי מספר דירה, קומה או לקוח",
  SELECT_ALL: "בחירת כל הדירות",
  SELECTED_SUFFIX: "נבחרו",
  CLEAR: "נקה בחירה",
  SAVE: "שמירת שיתוף",
  REMOVE: "הסרת שיתוף",
  CANCEL: "ביטול",
  FUTURE_APARTMENTS: "דירות שיתווספו בהמשך לא ישותפו אוטומטית",
  NOT_APPROVED: "אפשר לשתף עם דירות לאחר אישור ההצעה.",
  NO_APARTMENTS: "אין דירות בבניין זה עדיין. דירות שיתווספו יוכלו להיבחר כאן לאחר הוספתן.",
  NO_RESULTS: "לא נמצאו דירות",
  LOADING: "טוען דירות...",
  SHARED_PREFIX: "משותפת ל-",
  APARTMENTS_SUFFIX: "דירות",
  NOT_SHARED: "ההצעה אינה משותפת עם דירות.",
  SAVED: "השיתוף נשמר",
  SELECT_AT_LEAST_ONE: "בחרו לפחות דירה אחת",
  REMOVAL_PREFIX: "שמירה תסיר את ההצעה מ-",
  REMOVAL_DETAIL: "ההצעה עצמה לא תימחק ושאר השיתופים לא ישתנו.",
  UNAVAILABLE_TITLE: "דירות שאינן זמינות עוד",
  UNAVAILABLE_CHIP: "הוסרה מהבניין",
  LIST_LABEL: "בחירת דירות לשיתוף",
  CHECKBOX_PREFIX: "שיתוף עם",
  NO_END_CUSTOMER: "ללא לקוח קצה",
  CONTEXT_LOCKED: "יש להסיר את השיתוף עם הדירות לפני החלפת פרויקט או לקוח",
  SHARED_FROM_BUILDING: "משותפת מבניין",
  APARTMENTS_PREVIEW_PREFIX: "דירות",
  RETRY: "נסה שוב",
} as const;

export const PROJECT_QUOTATIONS_COPY = {
  TITLE: "הצעות מחיר",
  SUBTITLE_SUFFIX: "הצעות",
  LOADING: "טוען הצעות מחיר...",
  EMPTY: "אין עדיין הצעות מחיר בפרויקט זה.",
  LOAD_MORE: "טען עוד הצעות",
  RETRY: "נסה שוב",
} as const;
