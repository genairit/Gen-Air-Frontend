import { theme } from "./theme.constants";
import { ICON_NAMES } from "./icon.constant";
import type { ITaskFormValues } from "../interfaces/task.interface";

export const TASK_STATUSES = {
  WAITING_FOR_RESPONSE: "waiting_for_response",
  NOT_STARTED: "not_started",
  IN_PROGRESS: "in_progress",
  IN_REVIEW: "in_review",
  PROPOSAL_SENT: "proposal_sent",
} as const;

export type TaskStatusType = (typeof TASK_STATUSES)[keyof typeof TASK_STATUSES];

export const TASK_STATUS_VALUES: TaskStatusType[] = Object.values(TASK_STATUSES);

export const TASK_STATUS_LABELS: Record<TaskStatusType, string> = {
  waiting_for_response: "מחכה לתשובה",
  not_started: "טרם בעבודה",
  in_progress: "בעבודה",
  in_review: "בבדיקה",
  proposal_sent: "נשלחה הצעה",
};

export const TASK_STATUS_OPTION_LABELS = TASK_STATUS_VALUES.map(
  status => TASK_STATUS_LABELS[status],
);

export const TASK_STATUS_TABS = TASK_STATUS_VALUES.map(status => ({
  id: status,
  label: TASK_STATUS_LABELS[status],
}));

export const TASK_STATUS_DOT_COLORS: Record<TaskStatusType, string> = {
  waiting_for_response: theme.palette.statusGray,
  not_started: theme.palette.charcoal,
  in_progress: theme.palette.primary,
  in_review: theme.palette.airBlueOutline,
  proposal_sent: theme.palette.danger,
};

export const TASK_FILTER_IDS = {
  ALL: "all",
  URGENT: "urgent",
} as const;

export const POOL_ASSIGNEE_ID = "__pool";

export const TASK_SCROLL_ROOT_MARGIN = "200px";

export const NEW_TASK_PROJECT_PARAM = "projectId";

export const EMPTY_TASK_FORM: ITaskFormValues = {
  title: "",
  dueDate: "",
  isUrgent: false,
  description: "",
  projectId: null,
  customerId: null,
  assigneeOptionId: null,
  isCustomerFromProject: false,
};

export const TASKS_PAGE_COPY = {
  EYEBROW: "המשימות שהוקצו לי",
  TITLE: "המשימות שלי",
  DESCRIPTION:
    "המשימות שהוקצו לך, בכל הפרויקטים והלקוחות. כאן אפשר לעקוב אחר דחיפות, תאריכי יעד וסטטוס.",
  NEW_TASK: "משימה חדשה",
  MANAGERS_ONLY: "הקצאת משימות למנהלים בלבד",
  ALL: "הכל",
  URGENT: "דחופות",
  SEARCH_PLACEHOLDER: "חיפוש במשימות שלי לפי משימה, פרויקט או לקוח...",
  NO_RESULTS: "לא נמצאו משימות שמתאימות לסינון",
  LOADING: "טוען משימות...",
  LOADING_MORE: "טוען עוד משימות...",
  ORDER_NOTE: "דחופות מוצגות ראשונות, אחר כך לפי תאריך יעד",
  CLAIM: "משוך אליי",
  POOL: "מאגר פתוח",
  URGENT_CHIP: "דחופה",
  OVERDUE: "באיחור",
  DUE_PREFIX: "עד",
} as const;

export const TASK_TABLE_HEADERS = {
  TASK: "משימה",
  STATUS: "סטטוס",
  ASSIGNEE: "אחראי",
  DUE: "תאריך יעד",
  URGENCY: "דחיפות",
} as const;

export const TASK_PAGE_COPY = {
  LOADING: "טוען את המשימה...",
  NOT_FOUND_TITLE: "המשימה לא נמצאה",
  BACK_TO_TASKS: "חזרה למשימות",
  STATUS_TITLE: "סטטוס",
  STATUS_HINT: "כל עובד יכול לעדכן",
  URGENT_TITLE: "משימה דחופה",
  REGULAR_TITLE: "משימה רגילה",
  REGULAR_TEXT: "ללא התראה. רק מנהל יכול לסמן משימה כדחופה.",
  MARK_URGENT: "סמן כדחופה…",
  CLEAR_URGENT: "הסר דחיפות…",
  URGENCY_MANAGERS_ONLY: "רק מנהל (תהילה או יוסי) יכול לשנות דחיפות",
  DETAILS_TITLE: "פרטי המשימה",
  DETAILS_SUBTITLE: "שיוך, תאריך יעד ותיאור",
  PROJECT: "פרויקט",
  CUSTOMER: "לקוח",
  ASSIGNEE: "אחראי",
  DUE_DATE: "תאריך יעד",
  DESCRIPTION: "תיאור",
  MANAGERS_ONLY: "מנהל בלבד",
  SAVE_DESCRIPTION: "שמור תיאור",
  SAVED: "השינויים נשמרו",
} as const;

export const NEW_TASK_COPY = {
  EYEBROW: "משימות",
  TITLE: "משימה חדשה",
  DESCRIPTION: "הקצאת משימה לפרויקט, ללקוח ולעובד.",
  DENIED_TITLE: "אין הרשאה להקצאת משימות",
  DENIED_DESCRIPTION: "רק תהילה ויוסי יכולים ליצור ולהקצות משימות.",
  BACK_TO_TASKS: "חזרה למשימות",
  ASSIGNMENT_TITLE: "שיוך",
  ASSIGNMENT_SUBTITLE: "פרויקט, לקוח ואחראי",
  PROJECT: "פרויקט",
  PROJECT_SEARCH: "חיפוש פרויקט לפי שם או מזהה...",
  NO_PROJECTS: "לא נמצא פרויקט שמתאים לחיפוש",
  REPLACE_PROJECT: "החלף פרויקט",
  CHOOSE_PROJECT: "בחר פרויקט",
  CUSTOMER: "לקוח",
  CHOOSE_CUSTOMER: "בחר לקוח...",
  CUSTOMER_FROM_PROJECT: "נבחר אוטומטית לפי הפרויקט, אפשר לשנות",
  ASSIGNEE: "אחראי",
  CHOOSE_ASSIGNEE: "בחר...",
  POOL_OPTION: "מאגר פתוח — כל מהנדס יכול למשוך",
  POOL_HINT: 'המשימה תופיע לכל המהנדסים עם "משוך אליי"',
  DETAILS_TITLE: "פרטי המשימה",
  DETAILS_SUBTITLE: "מה צריך לעשות ועד מתי",
  TASK_TITLE: "כותרת",
  TASK_TITLE_PLACEHOLDER: "לדוגמה: הכנת הצעת מחיר ליחידות VRF",
  DUE_DATE: "תאריך יעד",
  TASK_DESCRIPTION: "תיאור",
  TASK_DESCRIPTION_PLACEHOLDER: "פרט מה צריך לעשות, מה כבר ידוע ומה מצופה כתוצאה",
  URGENCY_TITLE: "דחיפות",
  URGENCY_SUBTITLE: "החלטה של מנהל · דחופה שולחת התראת Push מיידית",
  REGULAR: "רגילה",
  REGULAR_SUB: "ללא התראה",
  URGENT: "דחופה",
  URGENT_SUB: "שולחת התראת Push מיידית",
  CANCEL: "ביטול",
  SAVE: "שמור משימה",
  SAVE_URGENT: "שמור ושלח התראה",
  REQUIRED: "שדה חובה",
  PAST_DUE: "תאריך היעד לא יכול להיות בעבר",
} as const;

export const URGENCY_CONFIRM_COPY = {
  SET_TITLE: "לסמן את המשימה כדחופה?",
  CLEAR_TITLE: "להסיר את הדחיפות מהמשימה?",
  CLEAR_BODY: "הסימון יוסר מהמשימה. לא תישלח התראה נוספת, וההתראה שכבר נשלחה לא תבוטל.",
  CONFIRM_SET: "סמן כדחופה",
  CONFIRM_CLEAR: "הסר דחיפות",
  CANCEL: "ביטול",
  PREVIEW_PREFIX: "GENAIR · התראת Push אל",
  PREVIEW_TITLE_PREFIX: "משימה דחופה:",
  ENGINEERING_TEAM: "כל צוות ההנדסה",
  NEW_TASK: "משימה חדשה",
} as const;

export const PROJECT_TASKS_COPY = {
  TITLE: "משימות הפרויקט",
  NEW_TASK: "+ משימה חדשה",
  MANAGERS_ONLY: "מנהלים בלבד",
  EMPTY: "עדיין אין משימות בפרויקט הזה",
} as const;

export const TASK_PROJECT_RESULT_LIMIT = 5;

export const URGENCY_CHOICES = [
  {
    isUrgent: false,
    icon: ICON_NAMES.PENDING,
    title: NEW_TASK_COPY.REGULAR,
    subtitle: NEW_TASK_COPY.REGULAR_SUB,
  },
  {
    isUrgent: true,
    icon: ICON_NAMES.URGENT,
    title: NEW_TASK_COPY.URGENT,
    subtitle: NEW_TASK_COPY.URGENT_SUB,
  },
] as const;

export const TASK_HISTORY_PREVIEW_COUNT = 4;

export const TASK_HISTORY_COPY = {
  TITLE: "היסטוריית סטטוס",
  SUBTITLE: "החדש ביותר למעלה · שינויי סטטוס בלבד",
  CREATED_IN: "נוצרה בסטטוס",
  EMPTY_TITLE: "אין היסטוריית סטטוס למשימה הזו",
  EMPTY_DESCRIPTION:
    "המשימה נוצרה לפני שהמערכת התחילה לתעד שינויי סטטוס. שינויים חדשים יופיעו כאן מרגע שהסטטוס יעודכן.",
  PARTIAL_NOTE: "לפני עדכון זה אין תיעוד — המשימה נוצרה לפני תחילת ההיסטוריה",
  SHOW_LESS: "הצג פחות",
  LOADING: "טוען היסטוריה...",
} as const;
