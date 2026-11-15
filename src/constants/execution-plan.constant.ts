export const EXECUTION_PLAN_STATUS = {
  DRAFT: "draft",
  PENDING: "pending",
  APPROVED: "approved",
  RETURNED: "returned",
  CANCELLED: "cancelled",
} as const;

export type ExecutionPlanStatusType =
  (typeof EXECUTION_PLAN_STATUS)[keyof typeof EXECUTION_PLAN_STATUS];

export const EXECUTION_PLAN_STATUS_LABELS: Record<ExecutionPlanStatusType, string> = {
  draft: "טיוטה",
  pending: "ממתינה לאישור",
  approved: "תוכנית מאושרת",
  returned: "הוחזרה לתיקון",
  cancelled: "בוטלה",
};

export const EXECUTION_PLAN_TAB_ID = "pending-execution-plans";

export const EXECUTION_PLAN_COPY = {
  SUBMIT_ACTION: "הגש תוכנית לביצוע",
  SUBMIT_TITLE: "הגשת תוכנית לביצוע",
  SELECT_QUOTATION: "הצעת מחיר קשורה",
  PLAN_VERSION: "גרסת תוכנית",
  CHECKLIST: "בדיקות הנדסיות",
  SAVE_CHECKLIST: "שמור בדיקות",
  SEND_FOR_REVIEW: "שלח לאישור",
  REVIEW_TITLE: "אישור תוכנית לביצוע",
  APPROVE: "אשר תוכנית לביצוע",
  RETURN: "החזר לתיקון",
  RETURN_COMMENT: "סיבת החזרה לתיקון",
  CANCEL: "בטל הגשה",
  PENDING_TAB: "ממתינות לאישור",
  PENDING_EMPTY: "אין תוכניות לביצוע שממתינות לאישור.",
  NO_QUOTATIONS: "אין הצעות מחיר מקושרות לפרויקט או לדירה זו.",
  CHECKLIST_INCOMPLETE: "יש לאשר את כל בדיקות ההנדסה לפני ההגשה.",
  LOADING: "טוען תוכניות לביצוע…",
} as const;
