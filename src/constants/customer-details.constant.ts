import {
  validateFloor,
  validateIsraeliPhone,
  validateRequiredText,
  validateRequiredValue,
  validateRequiredEmail,
  validateCompanyNumber,
  validateAssociationNumber,
} from "../utilities/validators";

import {
  PROJECT_DETAIL_FIELD_SETS,
  type ProjectDetailFieldSetType,
} from "./project-detail-field-set.constant";

import { ICON_NAMES, type IconNameType } from "./icon.constant";
import type { CustomerDetailFieldType } from "../interfaces/api.interface";
import { keepDigits, keepPhoneCharacters } from "../utilities/text.utility";
import type { IValidationResult } from "../interfaces/validation-result.interface";
import { FIELD_INPUT_LIMITS, FIELD_VALIDATION_PATTERNS } from "./field-validation.constant";

export const CUSTOMER_FIELD_KINDS = {
  TEXT: "text",
  EMAIL: "email",
  PHONE: "phone",
  FLOOR: "floor",
  IDENTIFIER: "identifier",
  COMPANY_NUMBER: "companyNumber",
  ASSOCIATION_NUMBER: "associationNumber",
} as const;

export type CustomerFieldKindType =
  (typeof CUSTOMER_FIELD_KINDS)[keyof typeof CUSTOMER_FIELD_KINDS];

interface ICustomerFieldKindConfig {
  isLtr: boolean;
  pattern: string | null;
  sanitize: (value: string) => string;
  validate: (value: string) => IValidationResult;
  inputMode: "text" | "tel" | "email" | "numeric";
}

const keepAsTyped = (value: string) => value;

export const CUSTOMER_FIELD_KIND_CONFIG: Record<CustomerFieldKindType, ICustomerFieldKindConfig> = {
  text: {
    isLtr: false,
    pattern: null,
    inputMode: "text",
    sanitize: keepAsTyped,
    validate: validateRequiredText,
  },
  identifier: {
    isLtr: false,
    pattern: null,
    inputMode: "text",
    sanitize: keepAsTyped,
    validate: validateRequiredValue,
  },
  email: {
    isLtr: true,
    pattern: null,
    inputMode: "email",
    sanitize: keepAsTyped,
    validate: validateRequiredEmail,
  },
  phone: {
    isLtr: true,
    inputMode: "tel",
    validate: validateIsraeliPhone,
    pattern: FIELD_VALIDATION_PATTERNS.ISRAELI_PHONE,
    sanitize: value => keepPhoneCharacters(value, FIELD_INPUT_LIMITS.PHONE_CHARACTERS),
  },
  floor: {
    isLtr: true,
    inputMode: "numeric",
    sanitize: keepAsTyped,
    validate: validateFloor,
    pattern: FIELD_VALIDATION_PATTERNS.FLOOR,
  },
  companyNumber: {
    isLtr: true,
    inputMode: "numeric",
    validate: validateCompanyNumber,
    pattern: FIELD_VALIDATION_PATTERNS.COMPANY_NUMBER,
    sanitize: value => keepDigits(value, FIELD_INPUT_LIMITS.REGISTRATION_NUMBER_DIGITS),
  },
  associationNumber: {
    isLtr: true,
    inputMode: "numeric",
    validate: validateAssociationNumber,
    pattern: FIELD_VALIDATION_PATTERNS.ASSOCIATION_NUMBER,
    sanitize: value => keepDigits(value, FIELD_INPUT_LIMITS.REGISTRATION_NUMBER_DIGITS),
  },
};

export interface ICustomerDetailFieldConfig {
  label: string;
  icon: IconNameType;
  hint: string | null;
  placeholder: string;
  kind: CustomerFieldKindType;
  field: CustomerDetailFieldType;
}

export const CUSTOMER_DETAIL_FIELDS_BY_SET: Record<
  ProjectDetailFieldSetType,
  ICustomerDetailFieldConfig[]
> = {
  [PROJECT_DETAIL_FIELD_SETS.COMPANY]: [
    {
      hint: null,
      label: "שם החברה",
      field: "customerName",
      icon: ICON_NAMES.BUILDING,
      placeholder: "בבלי נדל״ן בע״מ",
      kind: CUSTOMER_FIELD_KINDS.TEXT,
    },
    {
      label: "ח.פ / ת.פ",
      icon: ICON_NAMES.QUOTE,
      placeholder: "9 ספרות",
      field: "customerCompanyNumber",
      hint: "ח.פ לחברה בע״מ · ת.פ לעוסק מורשה",
      kind: CUSTOMER_FIELD_KINDS.COMPANY_NUMBER,
    },
    {
      hint: null,
      label: "כתובת החברה",
      field: "customerAddress",
      icon: ICON_NAMES.LOCATION,
      placeholder: "רחוב ומספר, עיר",
      kind: CUSTOMER_FIELD_KINDS.TEXT,
    },
    {
      label: "טלפון החברה",
      field: "customerPhone",
      icon: ICON_NAMES.PHONE,
      placeholder: "052-1234567",
      kind: CUSTOMER_FIELD_KINDS.PHONE,
      hint: "נייד או קווי, עם או בלי מקף",
    },
    {
      hint: null,
      label: "דוא״ל החברה",
      field: "customerEmail",
      icon: ICON_NAMES.EMAIL,
      kind: CUSTOMER_FIELD_KINDS.EMAIL,
      placeholder: "name@company.co.il",
    },
  ],
  [PROJECT_DETAIL_FIELD_SETS.PRIVATE_CLIENT]: [
    {
      hint: null,
      label: "שם מלא",
      field: "customerName",
      icon: ICON_NAMES.CUSTOMER,
      placeholder: "ישראל ישראלי",
      kind: CUSTOMER_FIELD_KINDS.TEXT,
    },
    {
      hint: null,
      placeholder: "הרצל 12",
      field: "customerAddress",
      icon: ICON_NAMES.LOCATION,
      label: "כתובת (רחוב ומספר)",
      kind: CUSTOMER_FIELD_KINDS.TEXT,
    },
    {
      hint: null,
      label: "עיר",
      field: "customerCity",
      icon: ICON_NAMES.LOCATION,
      placeholder: "תל אביב-יפו",
      kind: CUSTOMER_FIELD_KINDS.TEXT,
    },
    {
      label: "טלפון נייד",
      field: "customerPhone",
      icon: ICON_NAMES.PHONE,
      placeholder: "052-1234567",
      kind: CUSTOMER_FIELD_KINDS.PHONE,
      hint: "נייד או קווי, עם או בלי מקף",
    },
    {
      hint: null,
      label: "דוא״ל",
      field: "customerEmail",
      icon: ICON_NAMES.EMAIL,
      placeholder: "name@email.com",
      kind: CUSTOMER_FIELD_KINDS.EMAIL,
    },
    {
      hint: null,
      label: "קומה",
      field: "customerFloor",
      placeholder: "לדוגמה: 7",
      icon: ICON_NAMES.BUILDING,
      kind: CUSTOMER_FIELD_KINDS.FLOOR,
    },
    {
      hint: null,
      label: "דירה",
      icon: ICON_NAMES.HOME,
      placeholder: "לדוגמה: 24",
      field: "customerApartment",
      kind: CUSTOMER_FIELD_KINDS.IDENTIFIER,
    },
  ],
  [PROJECT_DETAIL_FIELD_SETS.INSTITUTION]: [
    {
      hint: null,
      label: "שם המוסד",
      field: "customerName",
      placeholder: "עמותת …",
      icon: ICON_NAMES.BUILDING,
      kind: CUSTOMER_FIELD_KINDS.TEXT,
    },
    {
      icon: ICON_NAMES.QUOTE,
      placeholder: "58XXXXXXX",
      label: "מספר עמותה (מ״ע)",
      field: "customerAssociationNumber",
      hint: "מספר רישום העמותה ברשם העמותות",
      kind: CUSTOMER_FIELD_KINDS.ASSOCIATION_NUMBER,
    },
    {
      label: "טלפון",
      field: "customerPhone",
      icon: ICON_NAMES.PHONE,
      placeholder: "03-1234567",
      kind: CUSTOMER_FIELD_KINDS.PHONE,
      hint: "נייד או קווי, עם או בלי מקף",
    },
    {
      hint: null,
      label: "כתובת",
      field: "customerAddress",
      icon: ICON_NAMES.LOCATION,
      placeholder: "רחוב ומספר, עיר",
      kind: CUSTOMER_FIELD_KINDS.TEXT,
    },
    {
      hint: null,
      label: "דוא״ל",
      field: "customerEmail",
      icon: ICON_NAMES.EMAIL,
      placeholder: "name@org.org.il",
      kind: CUSTOMER_FIELD_KINDS.EMAIL,
    },
    {
      hint: null,
      label: "קומה",
      field: "customerFloor",
      placeholder: "לדוגמה: 2",
      icon: ICON_NAMES.BUILDING,
      kind: CUSTOMER_FIELD_KINDS.FLOOR,
    },
    {
      hint: null,
      label: "יחידה / אגף",
      field: "customerUnit",
      icon: ICON_NAMES.BUILDING,
      placeholder: "לדוגמה: אגף B",
      kind: CUSTOMER_FIELD_KINDS.IDENTIFIER,
    },
  ],
};

export const CUSTOMER_DETAIL_SHORT_LABELS: Record<CustomerDetailFieldType, string> = {
  customerName: "שם",
  customerCity: "עיר",
  customerUnit: "יחידה",
  customerFloor: "קומה",
  customerPhone: "טלפון",
  customerEmail: "דוא״ל",
  customerAddress: "כתובת",
  customerApartment: "דירה",
  customerAssociationNumber: "מ״ע",
  customerCompanyNumber: "ח.פ / ת.פ",
};

export const CUSTOMER_DETAILS_TITLES: Record<ProjectDetailFieldSetType, string> = {
  company: "פרטי החברה",
  institution: "פרטי המוסד",
  private_client: "פרטי הלקוח",
};

export const CUSTOMER_DETAILS_COPY = {
  VALID: "✓ תקין",
  EMPTY_VALUE: "—",
  LABEL_SEPARATOR: ", ",
  UNDO_SWITCH: "בטל מעבר",
  DISMISS_SWITCH: "הבנתי",
  EDIT_DETAILS: "עריכת פרטים",
  RESERVED_HELPER_LINE: "\u00a0",
  SUBTITLE: "כל השדות חובה · השדות משתנים לפי סוג הפרויקט שנבחר",
} as const;
