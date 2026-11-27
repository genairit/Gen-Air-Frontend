import {
  USER_ROLES,
  USER_ROLE_PLURAL_LABELS,
  ASSIGNABLE_USER_ROLE_VALUES,
} from "./user-role.constant";

import { PASSWORD_RULES } from "./password.constant";
import type { IEmployeeFilter, IEmployeeFormValues } from "../interfaces/employee.interface";

export const ALL_EMPLOYEES_FILTER_ID = "all";

export const EMPLOYEE_FILTERS: IEmployeeFilter[] = [
  { id: ALL_EMPLOYEES_FILTER_ID, label: "הכל", role: null },
  ...ASSIGNABLE_USER_ROLE_VALUES.map(role => ({
    id: role,
    role,
    label: USER_ROLE_PLURAL_LABELS[role],
  })),
];

export const EMPLOYEE_PAGE_SIZE = 5;

export const EMPLOYEES_COPY = {
  ADD_TITLE: "הוספת עובד",
  NAME_LABEL: "שם מלא",
  NAME_PLACEHOLDER: "לדוגמה: יובל אל",
  EMAIL_LABEL: "כתובת דוא״ל",
  EMAIL_PLACEHOLDER: "yuval@genair.co.il",
  PHONE_LABEL: "טלפון נייד",
  PHONE_PLACEHOLDER: "0500000000",
  ROLE_LABEL: "תפקידים משויכים",
  ROLE_SEARCH: "חיפוש תפקיד",
  NO_MATCHING_ROLES: "לא נמצאו תפקידים",
  FILTER_BY_ROLE: "סינון לפי תפקיד",
  ROLE_SWITCHER_LABEL: "החלפת תפקיד פעיל",
  ROLE_ASSIGNMENT_REQUIRED: "יש לבחור לפחות תפקיד אחד",
  PASSWORD_LABEL: "סיסמה ראשונית",
  PASSWORD_HINT: `(לפחות ${PASSWORD_RULES.MIN_LENGTH} תווים)`,
  PASSWORD_CONFIRMATION_LABEL: "אימות סיסמה ראשונית",
  PASSWORD_SHARE_HINT: "יש ליצור סיסמה ייחודית ולמסור אותה לעובד בערוץ מאובטח ונפרד.",
  ADD_BUTTON: "הוסף עובד למערכת",
  LOADING: "טוען עובדים...",
  NAME_HINT: "שם פרטי ושם משפחה",
  SEARCH_PLACEHOLDER: "חיפוש עובד לפי שם, מייל, טלפון או תפקיד...",
  EDIT: "עריכת עובד",
  EDIT_ROLES_TITLE: "עריכת תפקידים והרשאות",
  SAVE_ROLE_CHANGES: "שמירת שינויים",
  CANCEL: "ביטול",
  DELETE: "מחיקת עובד",
  NEXT_PAGE: "העמוד הבא",
  PREVIOUS_PAGE: "העמוד הקודם",
} as const;

export const EMPLOYEE_TABLE_HEADERS = {
  PERSON: "עובד ופרטי קשר",
  EMAIL: "דוא״ל",
  PHONE: "טלפון",
  ASSIGNED_ROLES: "תפקידים משויכים",
  ACTIVE_ROLE: "תפקיד פעיל",
  ACTIONS: "פעולות ניהול",
} as const;

export const EMPTY_EMPLOYEE_FORM: IEmployeeFormValues = {
  name: "",
  email: "",
  phone: "",
  assignedRoles: [USER_ROLES.ENGINEER],
  password: "",
  passwordConfirmation: "",
};
