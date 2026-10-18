import {
  PROJECT_DETAIL_FIELD_SETS,
  type ProjectDetailFieldSetType,
} from "./project-detail-field-set.constant";

import { ICON_NAMES, type IconNameType } from "./icon.constant";
import { FIELD_VALIDATION_PATTERNS } from "./field-validation.constant";
import type { CustomerDetailFieldType } from "../interfaces/api.interface";
import { validateFloor, validateRequiredValue } from "../utilities/validators";
import type { IValidationResult } from "../interfaces/validation-result.interface";

export const CUSTOMER_FIELD_KINDS = {
  FLOOR: "floor",
  IDENTIFIER: "identifier",
} as const;

export type CustomerFieldKindType =
  (typeof CUSTOMER_FIELD_KINDS)[keyof typeof CUSTOMER_FIELD_KINDS];

interface ICustomerFieldKindConfig {
  isLtr: boolean;
  pattern: string | null;
  inputMode: "text" | "numeric";
  sanitize: (value: string) => string;
  validate: (value: string) => IValidationResult;
}

const keepAsTyped = (value: string) => value;

export const CUSTOMER_FIELD_KIND_CONFIG: Record<CustomerFieldKindType, ICustomerFieldKindConfig> = {
  identifier: {
    isLtr: false,
    pattern: null,
    inputMode: "text",
    sanitize: keepAsTyped,
    validate: validateRequiredValue,
  },
  floor: {
    isLtr: true,
    inputMode: "numeric",
    sanitize: keepAsTyped,
    validate: validateFloor,
    pattern: FIELD_VALIDATION_PATTERNS.FLOOR,
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

export const SITE_DETAIL_FIELDS_BY_SET: Record<
  ProjectDetailFieldSetType,
  ICustomerDetailFieldConfig[]
> = {
  [PROJECT_DETAIL_FIELD_SETS.COMPANY]: [],
  [PROJECT_DETAIL_FIELD_SETS.PRIVATE_CLIENT]: [
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

export const CUSTOMER_DETAILS_COPY = {
  VALID: "✓ תקין",
  EMPTY_VALUE: "—",
  LABEL_SEPARATOR: ", ",
  UNDO_SWITCH: "בטל מעבר",
  DISMISS_SWITCH: "הבנתי",
  EDIT_DETAILS: "עריכת פרטים",
  RESERVED_HELPER_LINE: "\u00a0",
  SITE_TITLE: "פרטי הנכס",
  VIEW_TITLE: "לקוח ופרטי הנכס",
  SITE_SUBTITLE: "פרטי הנכס לפי סוג הפרויקט שנבחר",
} as const;
