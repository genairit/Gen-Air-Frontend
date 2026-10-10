import type { IEmployeeFilter, IEmployeeFormValues } from "../interfaces/employee.interface";
import { USER_ROLES, PROJECT_ROLE_SLOTS, USER_ROLE_PLURAL_LABELS } from "./user-role.constant";

export const ALL_EMPLOYEES_FILTER_ID = "all";

export const EMPLOYEE_FILTERS: IEmployeeFilter[] = [
  { id: ALL_EMPLOYEES_FILTER_ID, label: "הכל", role: null },
  ...PROJECT_ROLE_SLOTS.map(role => ({ id: role, role, label: USER_ROLE_PLURAL_LABELS[role] })),
];

export const EMPLOYEE_PAGE_SIZE = 5;

const DEFAULT_TEMPORARY_PASSWORD = "temp1234";

export const EMPLOYEES_COPY = {
  TITLE: "ניהול עובדים ומשתמשים",
  EYEBROW: "פורטל ניהול משא״ש והרשאות אבטחה",
  DESCRIPTION:
    "הוספה, עריכה וניהול הרשאות ותפקידי עובדים במערכת GEN-AIR. הקצאת גישה מאובטחת ומעקב כניסות למנהלים, צוותי שטח ומשרד.",
  ADD_TITLE: "הוספת עובד / משתמש חדש",
  ADD_SUBTITLE: "יצירת חשבון משתמש, שיוך תפקיד תפעולי וקביעת סיסמת כניסה זמנית",
  NAME_LABEL: "שם מלא",
  NAME_PLACEHOLDER: "לדוגמה: יובל אל",
  EMAIL_LABEL: "כתובת דוא״ל",
  EMAIL_PLACEHOLDER: "yuval@gen-air.co.il",
  PHONE_LABEL: "טלפון נייד",
  PHONE_PLACEHOLDER: "0500000000",
  ROLE_LABEL: "תפקיד והרשאה",
  PASSWORD_LABEL: "סיסמה ראשונית",
  PASSWORD_HINT: "(מוצפנת)",
  ADD_BUTTON: "הוסף עובד למערכת",
  LOADING: "טוען עובדים...",
  NAME_HINT: "שם פרטי ושם משפחה",
  SEARCH_PLACEHOLDER: "חיפוש עובד לפי שם, מייל, טלפון או תפקיד...",
  EDIT: "עריכת עובד",
  DELETE: "מחיקת עובד",
  NEXT_PAGE: "העמוד הבא",
  PREVIOUS_PAGE: "העמוד הקודם",
} as const;

export const EMPLOYEE_TABLE_HEADERS = {
  PERSON: "עובד ופרטי קשר",
  EMAIL: "דוא״ל",
  PHONE: "טלפון",
  ROLE: "תפקיד והרשאה",
  ACTIONS: "פעולות ניהול",
} as const;

export const EMPTY_EMPLOYEE_FORM: IEmployeeFormValues = {
  name: "",
  email: "",
  phone: "",
  role: USER_ROLES.LEAD_INSTALLER,
  password: DEFAULT_TEMPORARY_PASSWORD,
};
