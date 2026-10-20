import {
  USER_ROLES,
  ROLE_PERMISSIONS,
  USER_ROLE_LABELS,
  type PermissionType,
  USER_ROLE_PLURAL_LABELS,
} from "./user-role.constant";

import { ICON_NAMES, type IconNameType } from "./icon.constant";
import type { IUserQuery } from "../interfaces/api-request.interface";

export const PROJECT_FORM_MODES = {
  NEW: "new",
  EDIT: "edit",
} as const;

export type ProjectFormModeType = (typeof PROJECT_FORM_MODES)[keyof typeof PROJECT_FORM_MODES];

interface IProjectFormModeCopy {
  title: string;
  deniedTitle: string;
  submitLabel: string;
  detailsTitle: string;
  detailsSubtitle: string;
  submitIcon: IconNameType;
  deniedDescription: string;
}

export const PROJECT_FORM_MODE_COPY: Record<ProjectFormModeType, IProjectFormModeCopy> = {
  new: {
    title: "יצירת פרויקט חדש",
    submitLabel: "צור פרויקט",
    detailsTitle: "פרטים כלליים",
    submitIcon: ICON_NAMES.ADD,
    detailsSubtitle: "הכותרת הרשמית המשמשת בכל חישובי ההנדסה וההזמנות",
    deniedTitle: "אין הרשאה ליצירת פרויקטים",
    deniedDescription: `רק ${USER_ROLE_LABELS[USER_ROLES.SYSTEM_ADMIN]} יכולים ליצור פרויקטים.`,
  },
  edit: {
    title: "עריכת פרויקט",
    submitLabel: "שמור שינויים",
    submitIcon: ICON_NAMES.SAVE,
    detailsTitle: "פרטי הפרויקט וסטטוס",
    detailsSubtitle: "ניהול פרטי הזיהוי ושלב מחזור החיים של הפרויקט",
    deniedTitle: "אין הרשאה לעריכת פרויקטים",
    deniedDescription: `רק ${ROLE_PERMISSIONS.EDIT_PROJECTS.map(role => USER_ROLE_PLURAL_LABELS[role]).join(", ")} יכולים לערוך פרויקטים.`,
  },
};

export const PROJECT_FORM_MODE_PERMISSIONS: Record<ProjectFormModeType, PermissionType> = {
  new: "CREATE_PROJECTS",
  edit: "EDIT_PROJECTS",
};

export const PROJECT_FORM_COPY = {
  CANCEL: "ביטול",
  DRAFT_RESTORED: "טיוטת הפרויקט שוחזרה",
  DRAFT_NOTICE: "פרטי הפרויקט נשמרים כטיוטה במכשיר זה",
  DISCARD_DRAFT: "מחק טיוטה והתחל מחדש",
  DRAFT_PRIVACY:
    "שם הפרויקט, סוג, שלב, צוות ותנאי תשלום נשמרים. פרטי לקוח, כתובת, איש קשר והערות תשלום אינם נשמרים ויש להזינם מחדש בחזרה לטופס.",
  LOADING: "טוען את טופס הפרויקט...",
  PENDING_CODE: "מזהה יוקצה בשמירה",
  NO_ASSIGNEE: "ללא שיבוץ",
  DELETE: "מחק פרויקט",
  STATUS_LABEL: "סטטוס פרויקט",
  ASSIGNEE_LABEL: "איש צוות מוקצה",
  TYPE_TITLE: "בחירת סוג פרויקט",
  ROLES_TITLE: "הקצאת תפקידים וצוות",
  NAME_LABEL: "שם הפרויקט / כותרת הנדסית",
  NAME_HINT: "הכותרת הרשמית בכל חישובי ההנדסה וההזמנות",
  TYPE_SUBTITLE: "בחר את הסיווג המרכזי של הפרויקט לקביעת מפרט הציוד",
  ROLES_SUBTITLE: "הגדרת בעלי תפקידים ראשיים עם הרשאות לוח בקרה מתאימות",
  NOTICE: "כל השינויים ישלחו התראות מיידיות ב-Slack ובאימייל לאנשי הצוות המוקצים.",
} as const;

export const ALL_USERS_QUERY: IUserQuery = { search: "", role: null };
