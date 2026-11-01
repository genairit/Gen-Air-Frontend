import { FIELD_INPUT_LIMITS } from "./field-validation.constant";
import { FIELD_TYPES } from "../components/TextField/constants/textfield.constants";

export const CUSTOMER_CONTACT_COPY = {
  SUMMARY_LABEL: "אנשי קשר · מתוך כרטיס הלקוח",
  SUMMARY_EMPTY: "לא הוגדרו אנשי קשר ללקוח. אפשר להוסיף בכרטיס הלקוח.",
  NO_ROLE: "ללא תפקיד",
  COMMON_ROLES: "תפקידים נפוצים:",
  EDITOR_TITLE: "פרטי איש קשר",
  EMPTY_TITLE: "עדיין אין אנשי קשר ללקוח הזה",
  EMPTY_SUBTITLE: "אנשי קשר שייווצרו כאן יהיו זמינים בכל הפרויקטים של הלקוח.",
  TITLE: "אנשי הקשר של הלקוח",
  SUBTITLE: "כל אנשי הקשר משותפים לפרויקטים ולדירות של הלקוח",
  EMPTY: "טרם נוספו אנשי קשר ללקוח",
  LOADING: "טוען אנשי קשר...",
  ADD: "הוספת איש קשר",
  EDIT: "עריכה",
  RETRY: "נסה שוב",
  SAVE: "שמירה",
  CANCEL: "ביטול",
  LEGACY: "פרטי קשר היסטוריים — טרם הוסבו לאנשי קשר של הלקוח",
  NAME_ERROR: "יש להזין שם איש קשר תקין",
  PHONE_ERROR: "מספר הטלפון אינו תקין",
  EMAIL_ERROR: "כתובת הדוא״ל אינה תקינה",
  ROLE_ERROR: "התפקיד ארוך מהמותר",
} as const;

export const CUSTOMER_CONTACT_QUERY_ROOT = "customer-contacts";
export const CUSTOMER_CONTACT_ENDPOINTS = {
  list: (customerId: string) => `/customer/${customerId}/contacts`,
  item: (customerId: string, contactId: string) => `/customer/${customerId}/contacts/${contactId}`,
} as const;

export const CUSTOMER_CONTACT_FIELDS = [
  {
    field: "name",
    label: "שם",
    type: FIELD_TYPES.TEXT,
    isLtr: false,
    required: true,
    maxLength: FIELD_INPUT_LIMITS.CUSTOMER_NAME_CHARACTERS,
  },
  {
    field: "phone",
    label: "טלפון",
    type: FIELD_TYPES.TEXT,
    isLtr: true,
    required: false,
    maxLength: FIELD_INPUT_LIMITS.PHONE_CHARACTERS,
  },
  {
    field: "email",
    label: "דוא״ל",
    type: FIELD_TYPES.TEXT,
    isLtr: true,
    required: false,
    maxLength: 254,
  },
  {
    field: "role",
    label: "תפקיד",
    type: FIELD_TYPES.TEXT,
    isLtr: false,
    required: false,
    maxLength: FIELD_INPUT_LIMITS.CONTACT_ROLE_CHARACTERS,
  },
] as const;

export const CUSTOMER_CONTACT_ROLE_SUGGESTIONS = [
  "מנהל פרויקט",
  "קבלן ראשי",
  "מהנדס",
  "בעל הבית",
  "מנהל אחזקה",
] as const;
