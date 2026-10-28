import {
  validateContactName,
  validateRequiredValue,
  validateIsraeliMobilePhone,
} from "../utilities/validators";

import { ICON_NAMES, type IconNameType } from "./icon.constant";
import { keepPhoneCharacters } from "../utilities/text.utility";
import { FIELD_INPUT_LIMITS } from "./field-validation.constant";
import type { ContactFieldType } from "../interfaces/project.interface";
import type { IValidationResult } from "../interfaces/validation-result.interface";

export interface IContactFieldConfig {
  label: string;
  isLtr: boolean;
  maxLength: number;
  icon: IconNameType;
  hint: string | null;
  placeholder: string;
  field: ContactFieldType;
  inputMode: "text" | "tel";
  sanitize: (value: string) => string;
  validate: (value: string) => IValidationResult;
}

const keepAsTyped = (value: string) => value;

export const CONTACT_FIELDS: IContactFieldConfig[] = [
  {
    hint: null,
    isLtr: false,
    label: "שם מלא",
    inputMode: "text",
    field: "contactName",
    sanitize: keepAsTyped,
    icon: ICON_NAMES.CUSTOMER,
    placeholder: "ישראל ישראלי",
    validate: validateContactName,
    maxLength: FIELD_INPUT_LIMITS.CONTACT_NAME_CHARACTERS,
  },
  {
    isLtr: true,
    inputMode: "tel",
    label: "טלפון נייד",
    field: "contactPhone",
    icon: ICON_NAMES.PHONE,
    placeholder: "052-1234567",
    validate: validateIsraeliMobilePhone,
    hint: "נייד בלבד — לעדכוני SMS ולצוות השטח",
    maxLength: FIELD_INPUT_LIMITS.MOBILE_PHONE_CHARACTERS,
    sanitize: value => keepPhoneCharacters(value, FIELD_INPUT_LIMITS.MOBILE_PHONE_CHARACTERS),
  },
  {
    hint: null,
    isLtr: false,
    label: "תפקיד",
    inputMode: "text",
    field: "contactRole",
    sanitize: keepAsTyped,
    icon: ICON_NAMES.CONTACTS,
    validate: validateRequiredValue,
    placeholder: "לדוגמה: מנהל פרויקט",
    maxLength: FIELD_INPUT_LIMITS.CONTACT_ROLE_CHARACTERS,
  },
];

export const CONTACT_ROLE_SUGGESTIONS = [
  "מנהל פרויקט",
  "קבלן ראשי",
  "מהנדס",
  "בעל הבית",
  "מנהל אחזקה",
] as const;

export const PROJECT_CONTACT_COPY = {
  EDIT: "עריכה",
  ROLE_LABEL: "תפקיד",
  CONTACT_LABEL: "איש קשר היסטורי בפרויקט",
  PHONE_LABEL: "טלפון נייד",
  VERIFIED_BADGE: "✓ מאומתת",
  COMMON_ROLES: "תפקידים נפוצים:",
  CARD_TITLE: "כתובת הפרויקט ואיש קשר",
  VIEW_TITLE: "כתובת, איש קשר ותנאי תשלום",
  CARD_SUBTITLE: "שדות חובה · הכתובת חייבת להיות מאומתת מול Google Maps",
} as const;
