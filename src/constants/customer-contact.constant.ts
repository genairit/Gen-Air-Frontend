import { FIELD_INPUT_LIMITS } from "./field-validation.constant";
import { FIELD_TYPES } from "../components/TextField/constants/textfield.constants";

export const CUSTOMER_CONTACT_COPY = {
  SUMMARY_LABEL: "איש הקשר של הלקוח",
  SUMMARY_EMPTY: "לא הוגדר איש קשר ללקוח.",
  NO_ROLE: "ללא תפקיד",
  COMMON_ROLES: "תפקידים נפוצים:",
  EDITOR_TITLE: "פרטי איש קשר",
  EMPTY: "אין איש קשר ראשי",
  LOADING: "טוען אנשי קשר...",
  ADD: "הוספת איש קשר",
  EDIT: "עריכה",
  RETRY: "נסה שוב",
  SAVE: "שמירה",
  CANCEL: "ביטול",
  NAME_ERROR: "יש להזין שם איש קשר תקין",
  PHONE_ERROR: "מספר הטלפון אינו תקין",
  EMAIL_ERROR: "כתובת הדוא״ל אינה תקינה",
  ROLE_ERROR: "התפקיד ארוך מהמותר",
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
