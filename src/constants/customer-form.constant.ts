import { FIELD_INPUT_LIMITS } from "./field-validation.constant";
import type { ICustomerFormField } from "../interfaces/customer.interface";
import { CUSTOMER_OWN_CONTACT_FIELDS } from "./customer-own-contact.constant";
import { PROJECT_DETAIL_FIELD_SETS } from "./project-detail-field-set.constant";
import { FIELD_TYPES } from "../components/TextField/constants/textfield.constants";
import { validateRequiredText, validateCompanyNumber } from "../utilities/validators";

export const CUSTOMER_FORM_COPY = {
  EYEBROW: "לקוחות",
  TITLE: "לקוח חדש",
  ADD: "לקוח חדש",
  SAVE: "שמור לקוח",
  CANCEL: "ביטול",
  TYPE: "סוג הלקוח",
  IDENTITY: "זהות הלקוח",
  CONTACT: "פרטי קשר של הלקוח (לא חובה)",
  TOO_LONG: "הערך ארוך מדי",
  REQUIRED_TYPE: "בחר סוג לקוח",
  SUMMARY: "מה יישמר",
  BACK_TO_CUSTOMERS: "חזרה ללקוחות",
  DENIED_TITLE: "אין הרשאה ליצירת לקוחות",
  SUMMARY_SUBTITLE: "שדות המערכת נוצרים אוטומטית",
  IDENTITY_SUBTITLE: "סוג, שם, מספר רישום וכתובת",
  MANAGERS_ONLY: "רק מנהלים עם הרשאת ניהול לקוחות יכולים ליצור לקוחות",
  CONTACT_SUBTITLE: "הטלפון והדוא״ל הראשיים של הלקוח. אפשר להשאיר ריק.",
  DENIED_DESCRIPTION: "רק מנהלים עם הרשאת ניהול לקוחות יכולים ליצור לקוחות חדשים.",
  DESCRIPTION: "הלקוח נשמר ב-CRM וזמין מיד לשיוך לפרויקטים. סנכרון עם Priority יתווסף בהמשך.",
} as const;

export const CUSTOMER_FORM_SUMMARY = {
  CREATED_BY: "נוצר ע״י",
  PRIORITY_ID: "מזהה Priority",
  SYNC_STATUS: "סטטוס סנכרון",
  PRIORITY_ID_VALUE: "יוקצה כשהסנכרון עם Priority יופעל",
  SYNC_STATUS_VALUE: "ממתין ל-Priority · אין סנכרון אוטומטי",
} as const;

export const CUSTOMER_TYPE_OPTIONS = [
  { id: PROJECT_DETAIL_FIELD_SETS.COMPANY, label: "חברה" },
  { id: PROJECT_DETAIL_FIELD_SETS.PRIVATE_CLIENT, label: "לקוח פרטי" },
  { id: PROJECT_DETAIL_FIELD_SETS.INSTITUTION, label: "מוסד" },
];

export const EMPTY_CUSTOMER_FORM = {
  name: "",
  taxId: "",
  address: "",
  phone: "",
  email: "",
  customerType: PROJECT_DETAIL_FIELD_SETS.COMPANY,
};

export const CUSTOMER_IDENTITY_FIELDS: ICustomerFormField[] = [
  {
    field: "name",
    label: "שם הלקוח",
    placeholder: "בבלי נדל״ן ופיתוח בע״מ",
    hint: null,
    maxLength: FIELD_INPUT_LIMITS.CUSTOMER_NAME_CHARACTERS,
    inputType: FIELD_TYPES.TEXT,
    validator: validateRequiredText,
    isLtr: false,
  },
  {
    field: "taxId",
    label: "ח.פ / ת.פ / ת.ז",
    placeholder: "9 ספרות",
    hint: "9 ספרות, נבדק מול ספרת ביקורת",
    maxLength: 9,
    inputType: FIELD_TYPES.TEXT,
    validator: validateCompanyNumber,
    isLtr: true,
  },
  {
    field: "address",
    label: "כתובת",
    placeholder: "רחוב ומספר, עיר",
    hint: null,
    maxLength: 200,
    inputType: FIELD_TYPES.TEXT,
    validator: validateRequiredText,
    isLtr: false,
  },
];
export const CUSTOMER_CONTACT_FIELDS: ICustomerFormField[] = [...CUSTOMER_OWN_CONTACT_FIELDS];
export const CUSTOMER_FORM_FIELDS = [...CUSTOMER_IDENTITY_FIELDS, ...CUSTOMER_CONTACT_FIELDS];
