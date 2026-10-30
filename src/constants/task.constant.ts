import { theme } from "./theme.constants";
import { ICON_NAMES } from "./icon.constant";
import { USER_ROLES } from "./user-role.constant";
import { CHIP_VARIANTS, type ChipVariantType } from "./chip.constant";
import type { IUserQuery } from "../interfaces/api-request.interface";
import type { ITaskFormValues, ITaskLinkPayload } from "../interfaces/task.interface";

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

export const TASK_STATUS_DOT_COLORS: Record<TaskStatusType, string> = {
  waiting_for_response: theme.palette.statusGray,
  not_started: theme.palette.charcoal,
  in_progress: theme.palette.primary,
  in_review: theme.palette.airBlueOutline,
  proposal_sent: theme.palette.danger,
};

export const TASK_STATUS_TABS = TASK_STATUS_VALUES.map(status => ({
  id: status,
  label: TASK_STATUS_LABELS[status],
  dotColor: TASK_STATUS_DOT_COLORS[status],
}));

export const TASK_FILTER_IDS = {
  ALL: "all",
  URGENT: "urgent",
} as const;

export const TASK_LINK_KINDS = {
  CUSTOMER: "customer",
  PROJECT: "project",
} as const;

export type TaskLinkKindType = (typeof TASK_LINK_KINDS)[keyof typeof TASK_LINK_KINDS];

export const TASK_LINK_KIND_LABELS: Record<TaskLinkKindType, string> = {
  customer: "לקוח",
  project: "פרויקט",
};

export const TASK_LINK_CHIP_VARIANTS: Record<TaskLinkKindType, ChipVariantType> = {
  customer: CHIP_VARIANTS.INFO,
  project: CHIP_VARIANTS.INSET,
};

export const TASK_LINK_ID_FIELDS = {
  customer: "customerId",
  project: "projectId",
} as const satisfies Record<TaskLinkKindType, keyof ITaskLinkPayload>;

export const TASK_LINK_KIND_LABEL_ID = "task-link-kind-label";

export const POOL_ASSIGNEE_ID = "__pool";

export const TASK_SCROLL_ROOT_MARGIN = "200px";

export const NEW_TASK_PROJECT_PARAM = "projectId";

export const EMPTY_TASK_FORM: ITaskFormValues = {
  title: "",
  dueDate: "",
  isUrgent: false,
  description: "",
  projectId: null,
  linkKind: null,
  customerId: null,
  assigneeOptionId: null,
};

export const TASKS_PAGE_COPY = {
  EYEBROW: "המשימות שהוקצו לי",
  TITLE: "המשימות שלי",
  DESCRIPTION:
    "המשימות שהוקצו לך, בכל הפרויקטים והלקוחות. כאן אפשר לעקוב אחר דחיפות, תאריכי יעד וסטטוס.",
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
  STATUS_HINT: "עדכון סטטוס זמין לבעלי ההרשאה המתאימה",
  URGENT_TITLE: "משימה דחופה",
  REGULAR_TITLE: "משימה רגילה",
  REGULAR_TEXT: "ללא התראה. רק מנהל יכול לסמן משימה כדחופה.",
  MARK_URGENT: "סמן כדחופה…",
  CLEAR_URGENT: "הסר דחיפות…",
  URGENCY_MANAGERS_ONLY: "אין לך הרשאה לשנות דחיפות",
  DETAILS_TITLE: "פרטי המשימה",
  DETAILS_SUBTITLE: "שיוך, תאריך יעד ותיאור",
  LINKED_TO: "משויכת ל",
  PROJECT_CUSTOMER: "לקוח הפרויקט · מידע בלבד",
  ASSIGNEE: "אחראי",
  DUE_DATE: "תאריך יעד",
  DESCRIPTION: "תיאור",
  MANAGERS_ONLY: "נדרשת הרשאה",
  SAVE_DESCRIPTION: "שמור תיאור",
  SAVED: "השינויים נשמרו",
} as const;

export const NEW_TASK_COPY = {
  EYEBROW: "משימות",
  TITLE: "משימה חדשה",
  DESCRIPTION: "הקצאת משימה ללקוח או לפרויקט, ולעובד.",
  DENIED_TITLE: "אין הרשאה להקצאת משימות",
  DENIED_DESCRIPTION: "לחשבון שלך אין הרשאה ליצור משימות.",
  BACK_TO_TASKS: "חזרה למשימות",
  ASSIGNMENT_TITLE: "שיוך",
  ASSIGNMENT_SUBTITLE: "לקוח או פרויקט, ואחראי",
  LINK_KIND: "המשימה קשורה ל...",
  CHOOSE_LINK_KIND: "בחר אם המשימה קשורה ללקוח או לפרויקט",
  NO_LINK_KIND: "בחר לקוח או פרויקט כדי לשייך את המשימה",
  INFO_ONLY: "מידע בלבד",
  PROJECT_CUSTOMER: "לקוח הפרויקט:",
  PROJECT_CUSTOMER_NOTE: "לא נשמר כשיוך נוסף למשימה",
  PRIORITY_SYNCED: "סונכרן ל-Priority",
  NEW_CUSTOMER: "צור לקוח חדש",
  RETRY: "נסה שוב",
  UNDO: "בטל",
  DISMISS: "סגור",
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

export const TASK_LINK_PICKER_COPY = {
  customer: {
    LABEL: TASK_LINK_KIND_LABELS.customer,
    SEARCH: "חיפוש לקוח לפי שם או מזהה...",
    EMPTY: "לא נמצא לקוח שמתאים לחיפוש",
    LOADING: "טוען לקוחות…",
    ERROR: "לא הצלחנו לטעון את רשימת הלקוחות",
    SELECTED_LOADING: "טוען את הלקוח שנבחר…",
    SELECTED_ERROR: "לא הצלחנו לטעון את הלקוח שנבחר",
    REPLACE: "החלף לקוח",
    REQUIRED: "בחר לקוח",
  },
  project: {
    LABEL: TASK_LINK_KIND_LABELS.project,
    SEARCH: "חיפוש פרויקט לפי שם או מזהה...",
    EMPTY: "לא נמצא פרויקט שמתאים לחיפוש",
    LOADING: "טוען פרויקטים…",
    ERROR: "לא הצלחנו לטעון את רשימת הפרויקטים",
    SELECTED_LOADING: "טוען את הפרויקט שנבחר…",
    SELECTED_ERROR: "לא הצלחנו לטעון את הפרויקט שנבחר",
    REPLACE: "החלף פרויקט",
    REQUIRED: "בחר פרויקט",
  },
} as const satisfies Record<TaskLinkKindType, Record<string, string>>;

export const TASK_LINK_CHOICES = [
  {
    kind: TASK_LINK_KINDS.CUSTOMER,
    icon: ICON_NAMES.CUSTOMER,
    title: TASK_LINK_KIND_LABELS.customer,
    subtitle: "משימה כללית מול לקוח, ללא פרויקט מסוים",
  },
  {
    kind: TASK_LINK_KINDS.PROJECT,
    icon: ICON_NAMES.PROJECTS,
    title: TASK_LINK_KIND_LABELS.project,
    subtitle: "משימה בתוך פרויקט או בניין. הלקוח יוצג כמידע בלבד",
  },
] as const;

export const TASK_LINK_RESULT_LIMITS: Record<TaskLinkKindType, number> = {
  customer: 6,
  project: 5,
};

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

export const TASK_STATUS_MUTATION_KEY = ["task-status-update"] as const;

export const TASK_ASSIGNEES_QUERY: IUserQuery = { search: "", role: USER_ROLES.ENGINEER };
