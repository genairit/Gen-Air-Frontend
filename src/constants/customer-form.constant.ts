import {
  validateContactName,
  validateRequiredText,
  validateIsraeliPhone,
  validateRequiredEmail,
  validateCompanyNumber,
} from "../utilities/validators";

import type { ICustomerFormField } from "../interfaces/customer.interface";
import { PROJECT_DETAIL_FIELD_SETS } from "./project-detail-field-set.constant";
import { FIELD_TYPES } from "../components/TextField/constants/textfield.constants";

export const CUSTOMER_FORM_COPY = {
  TITLE: "לקוח חדש",
  SAVE: "שמור לקוח",
  CANCEL: "ביטול",
  TYPE: "סוג הלקוח",
  IDENTITY: "זהות הלקוח",
  CONTACT: "איש קשר ראשי",
  ADD: "+ לקוח חדש",
  DENIED: "אין הרשאה ליצור לקוח",
  DESCRIPTION: "הלקוח יישמר ב-CRM ויהיה זמין לשיוך לפרויקטים. סנכרון Priority יתווסף בהמשך.",
  INVALID: "יש לתקן את השדות המסומנים לפני השמירה",
  TOO_LONG: "הערך ארוך מדי",
  REQUIRED_TYPE: "בחר סוג לקוח",
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
  contactName: "",
  phone: "",
  email: "",
  customerType: PROJECT_DETAIL_FIELD_SETS.COMPANY,
};

export const CUSTOMER_IDENTITY_FIELDS: ICustomerFormField[] = [
  {
    field: "name",
    label: "שם הלקוח",
    maxLength: 200,
    inputType: FIELD_TYPES.TEXT,
    validator: validateRequiredText,
    isLtr: false,
  },
  {
    field: "taxId",
    label: "ח.פ / מ״ע / ת.ז",
    maxLength: 9,
    inputType: FIELD_TYPES.TEXT,
    validator: validateCompanyNumber,
    isLtr: true,
  },
  {
    field: "address",
    label: "כתובת",
    maxLength: 200,
    inputType: FIELD_TYPES.TEXT,
    validator: validateRequiredText,
    isLtr: false,
  },
];
export const CUSTOMER_CONTACT_FIELDS: ICustomerFormField[] = [
  {
    field: "contactName",
    label: "איש קשר ראשי",
    maxLength: 120,
    inputType: FIELD_TYPES.TEXT,
    validator: validateContactName,
    isLtr: false,
  },
  {
    field: "phone",
    label: "טלפון",
    maxLength: 20,
    inputType: FIELD_TYPES.PHONE,
    validator: validateIsraeliPhone,
    isLtr: true,
  },
  {
    field: "email",
    label: "דוא״ל",
    maxLength: 254,
    inputType: FIELD_TYPES.EMAIL,
    validator: validateRequiredEmail,
    isLtr: true,
  },
];
export const CUSTOMER_FORM_FIELDS = [...CUSTOMER_IDENTITY_FIELDS, ...CUSTOMER_CONTACT_FIELDS];
