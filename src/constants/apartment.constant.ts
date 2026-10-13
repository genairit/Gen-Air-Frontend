import {
  validateFloor,
  validateContactName,
  validateRequiredValue,
  validateIsraeliMobilePhone,
  validateOptionalIsraeliPhone,
} from "../utilities/validators";

import type {
  IApartmentFormValues,
  TInheritanceSourceType,
  IInheritanceBadgeConfig,
  IApartmentFormFieldConfig,
} from "../interfaces/apartment.interface";

import { CHIP_VARIANTS } from "./chip.constant";
import { VALID_FIELD } from "../utilities/field-feedback.utility";
import { FIELD_TYPES } from "../components/TextField/constants/textfield.constants";

export const ALL_STAGES_TILE_ID = "all";

export const APARTMENT_SCROLL_THRESHOLD_PX = 200;

export const EMPTY_APARTMENT_FORM: IApartmentFormValues = {
  floor: "",
  contactName: "",
  contactPhone: "",
  customerName: "",
  customerPhone: "",
  apartmentNumber: "",
};

export const APARTMENT_UNIT_FIELDS: IApartmentFormFieldConfig[] = [
  {
    field: "floor",
    label: "קומה",
    isRequired: true,
    placeholder: "לדוגמה: 7",
    type: FIELD_TYPES.TEXT,
    validate: validateFloor,
  },
  {
    field: "apartmentNumber",
    label: "מספר דירה",
    isRequired: true,
    placeholder: "לדוגמה: 24",
    type: FIELD_TYPES.TEXT,
    validate: validateRequiredValue,
  },
];

export const APARTMENT_PEOPLE_FIELDS: IApartmentFormFieldConfig[] = [
  {
    field: "customerName",
    isRequired: false,
    label: "לקוח קצה: שם מלא",
    placeholder: "ישראל ישראלי",
    type: FIELD_TYPES.TEXT,
    validate: () => VALID_FIELD,
  },
  {
    field: "customerPhone",
    isRequired: false,
    label: "לקוח קצה: טלפון נייד",
    placeholder: "052-1234567",
    type: FIELD_TYPES.PHONE,
    validate: validateOptionalIsraeliPhone,
  },
  {
    field: "contactName",
    isRequired: true,
    label: "איש קשר: שם מלא",
    placeholder: "ישראל ישראלי",
    type: FIELD_TYPES.TEXT,
    validate: validateContactName,
  },
  {
    field: "contactPhone",
    isRequired: true,
    label: "איש קשר: טלפון נייד",
    placeholder: "052-1234567",
    type: FIELD_TYPES.PHONE,
    validate: validateIsraeliMobilePhone,
  },
];

export const INHERITANCE_BADGES: Record<TInheritanceSourceType, IInheritanceBadgeConfig> = {
  building: { label: "מפרויקט האב", variant: CHIP_VARIANTS.INFO },
  overridden: { label: "שונה בדירה", variant: CHIP_VARIANTS.DARK },
  own: { label: "נקבע בדירה", variant: CHIP_VARIANTS.INSET },
};

export const BUILDING_PAGE_COPY = {
  ADD_APARTMENT: "הוסף דירה",
  SUBTITLE: "פרויקט אב · כל דירה מנוהלת כתת-פרויקט עם שלב משלה",
  INHERITED_TITLE: "נתונים שעוברים לכל הדירות",
  INHERITED_SUBTITLE: "עריכה כאן מתעדכנת בכל דירה שלא שינתה את הערך",
  PROJECT_TYPE: "סוג פרויקט",
  ADDRESS: "כתובת הבניין",
  PAYMENT_TERMS: "תנאי תשלום",
  PARENT_NOTES: "הערות האב",
  TAMA_BADGE: "תמ״א",
  NO_NOTES: "אין הערות לבניין",
  STAGES_TITLE: "דירות לפי שלב",
  STAGES_SUBTITLE: "לחיצה על שלב מסננת את הטבלה",
  ALL_STAGES: "הכל",
  APARTMENTS_TITLE: "דירות הבניין",
  SEARCH_PLACEHOLDER: "חיפוש לפי מספר דירה, לקוח או קוד...",
  EMPTY_TITLE: "עדיין אין דירות בבניין הזה",
  EMPTY_DESCRIPTION:
    "הוסף דירה ראשונה. כל דירה תירש מהבניין את סוג הפרויקט, הכתובת, תנאי התשלום וההערות.",
  NO_RESULTS: "לא נמצאו דירות שמתאימות לחיפוש או לשלב שנבחר",
  LOADING: "טוען דירות...",
  LOADING_MORE: "טוען עוד דירות...",
  SELECTED: "דירות נבחרו",
  CHANGE_STAGE: "שנה שלב ל…",
  CLEAR_SELECTION: "נקה בחירה",
  SELECT_ALL: "בחר את כל הדירות המוצגות",
  NO_END_CUSTOMER: "ללא לקוח קצה",
} as const;

export const APARTMENT_TABLE_HEADERS = {
  APARTMENT: "דירה",
  END_CUSTOMER: "לקוח קצה",
  CONTACT: "איש קשר",
  STAGE: "שלב",
} as const;

export const APARTMENT_PAGE_COPY = {
  LOADING: "טוען את פרטי הדירה...",
  NOT_FOUND_TITLE: "הדירה לא נמצאה",
  BOARD: "לוח בקרה",
  BUILDING_PREFIX: "בניין",
  SUB_PROJECT: "תת-פרויקט",
  PREVIOUS: "דירה קודמת ›",
  NEXT: "‹ דירה הבאה",
  STAGE_TITLE: "שלב הדירה",
  STAGE_HINT: "עצמאי משלב הבניין",
  END_CUSTOMER_TITLE: "לקוח קצה — דירה זו",
  SEPARATE_FROM_PARENT: "נפרד מלקוח האב",
  NAME: "שם",
  PHONE: "טלפון",
  NO_END_CUSTOMER: "לא שויך לקוח קצה לדירה זו",
  PARENT_CUSTOMER_NOTE: "לקוח הפרויקט האב אינו לקוח הקצה של הדירה ואינו עובר אליה.",
  CONTACT_TITLE: "איש קשר",
  CONTACT_SUBTITLE: "איש הקשר נקבע לכל דירה בנפרד",
  CONTACT_NAME: "איש קשר",
  CONTACT_PHONE: "טלפון נייד",
  INHERITED_TITLE: "נתונים מהפרויקט האב",
  INHERITED_SUBTITLE: "ערך שהוגדר באב מתעדכן אוטומטית, אלא אם שונה בדירה",
  FOLLOWS_PARENT: "עוקב אחרי האב",
  LOCAL_VALUE: "ערך מקומי, אפשר לחזור לאב",
  APARTMENT_ONLY: "שייך לדירה בלבד",
  PROJECT_TYPE: "סוג פרויקט",
  ADDRESS: "כתובת הבניין",
  UNIT: "קומה ומספר דירה",
  UNIT_SUB: "מתווספים לכתובת הבניין",
  PAYMENT_TERMS: "תנאי תשלום",
  LOCKED_TYPE: "🔒 לא ניתן לשינוי בדירה",
  LOCKED_ADDRESS: "🔒 לא ניתן לשינוי · מזהה המקום של Google נשאר של הבניין",
  EDITABLE_HERE: "ניתן לעריכה בדירה זו",
  FOLLOWS_UPDATES: "מתעדכן אוטומטית כשהאב משתנה",
  OVERRIDE_NOTE: "שינויים בתנאי התשלום של האב לא ישפיעו על דירה זו",
  PARENT_VALUE_PREFIX: "ערך האב:",
  OVERRIDE: "שנה לדירה זו",
  RETURN_TO_PARENT: "חזור לערך האב",
  CHOOSE_TERMS: "בחר תנאי תשלום…",
  SAVE_TERMS: "שמור לדירה זו",
  CANCEL: "ביטול",
  PARENT_NOTES_TITLE: "הערות הפרויקט האב",
  READ_ONLY: "קריאה בלבד",
  PASSES_TO_ALL: "עוברת אוטומטית לכל דירה",
  OPEN_PARENT: "פתח בפרויקט האב ‹",
  NOTES_TITLE: "הערות הדירה",
  NOTES_SUBTITLE: "נראות רק בדירה זו",
  NOTES_PLACEHOLDER: "לדוגמה: הדייר זמין רק אחר הצהריים, גישה דרך חדר המדרגות המזרחי",
  NOTES_SAVED: "ההערות נשמרו",
} as const;

export const ADD_APARTMENT_COPY = {
  TITLE: "הוספת דירה",
  DESCRIPTION: "רק הפרטים של הדירה. כל השאר עובר מהבניין.",
  UNIT_TITLE: "פרטי הדירה",
  PEOPLE_TITLE: "לקוח קצה ואיש קשר",
  PEOPLE_SUBTITLE: "לקוח הקצה אופציונלי, איש הקשר חובה",
  INHERITED_TITLE: "עובר מהבניין",
  INHERITED_SUBTITLE: "קריאה בלבד, אפשר לשנות לדירה זו אחרי השמירה",
  FROM_PARENT: "מפרויקט האב",
  NOT_CHANGEABLE: "לא ניתן לשינוי",
  ADDRESS_NOTE: "לא ניתן לשינוי · מוסיפים קומה ומספר דירה",
  TERMS_NOTE: "מתעדכן אוטומטית עם האב",
  NOTES_LABEL: "הערות האב",
  NOTES_NOTE: "יופיעו בדירה בקריאה בלבד",
  HAS_NOTES: "כולל תמ״א",
  NO_NOTES: "אין הערות",
  CANCEL: "ביטול",
  SUBMIT: "הוסף דירה",
  FIX_FIELDS: "יש שדות לתיקון לפני השמירה",
} as const;
