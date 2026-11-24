import { FIELD_INPUT_LIMITS } from "./field-validation.constant";
import type { ICustomerOwnContactField } from "../interfaces/customer.interface";
import { FIELD_TYPES } from "../components/TextField/constants/textfield.constants";
import { validateIsraeliPhone, validateRequiredEmail } from "../utilities/validators";

export const CUSTOMER_OWN_CONTACT_COPY = {
  TITLE: "פרטי קשר של הלקוח",
  SUBTITLE: "הטלפון והדוא״ל הראשיים של הלקוח. אנשי הקשר של הפרויקט מנוהלים בנפרד.",
  PHONE_LABEL: "טלפון ראשי של הלקוח",
  EMAIL_LABEL: "דוא״ל של הלקוח",
  EMPTY_PHONE: "לא הוגדר טלפון",
  EMPTY_EMAIL: "לא הוגדר דוא״ל",
  EMPTY: "לא הוגדרו פרטי קשר",
  EDIT: "עריכה",
  SAVE: "שמירה",
  CANCEL: "ביטול",
} as const;

export const CUSTOMER_OWN_CONTACT_FIELDS: readonly ICustomerOwnContactField[] = [
  {
    field: "phone",
    label: CUSTOMER_OWN_CONTACT_COPY.PHONE_LABEL,
    placeholder: "+44 20 7183 8750",
    hint: "מספר ישראלי מקומי או מספר בינלאומי עם + וקידומת מדינה",
    maxLength: FIELD_INPUT_LIMITS.PHONE_CHARACTERS,
    inputType: FIELD_TYPES.PHONE,
    validator: validateIsraeliPhone,
    isLtr: true,
  },
  {
    field: "email",
    label: CUSTOMER_OWN_CONTACT_COPY.EMAIL_LABEL,
    placeholder: "name@company.co.il",
    hint: null,
    maxLength: FIELD_INPUT_LIMITS.EMAIL_CHARACTERS,
    inputType: FIELD_TYPES.EMAIL,
    validator: validateRequiredEmail,
    isLtr: true,
  },
];
