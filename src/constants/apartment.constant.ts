import type {
  IApartmentFormValues,
  TInheritanceSourceType,
  IInheritanceBadgeConfig,
  IApartmentFormFieldConfig,
} from "../interfaces/apartment.interface";

import { CHIP_VARIANTS } from "./chip.constant";
import { validateFloor } from "../utilities/validators";
import { FIELD_TYPES } from "../components/TextField/constants/textfield.constants";
import { validateApartmentNumber } from "../utilities/validators/apartment-number.validator";

export const APARTMENT_SCROLL_ROOT_MARGIN = "200px";

export const EMPTY_APARTMENT_FORM: IApartmentFormValues = {
  floor: "",
  customerId: null,
  engineerUserId: null,
  members: null,
  hasOwnLighting: false,
  hasGeneralLightingCeilingLowering: false,
  generalLightingCeilingLoweringHeight: "",
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
    validate: validateApartmentNumber,
  },
];

export const INHERITANCE_BADGES: Record<TInheritanceSourceType, IInheritanceBadgeConfig> = {
  building: { label: "מפרויקט האב", variant: CHIP_VARIANTS.INFO, description: "עוקב אחרי האב" },
  overridden: {
    label: "שונה בדירה",
    variant: CHIP_VARIANTS.DARK,
    description: "ערך מקומי, אפשר לחזור לאב",
  },
  own: { label: "נקבע בדירה", variant: CHIP_VARIANTS.INSET, description: "שייך לדירה בלבד" },
};

export const BUILDING_PAGE_COPY = {
  ADD_APARTMENT: "הוסף דירה",
  SUBTITLE: "פרויקט אב · כל דירה מנוהלת כתת-פרויקט עם שלב משלה",
  INHERITED_TITLE: "נתונים שעוברים לכל הדירות",
  INHERITED_SUBTITLE: "עריכה כאן מתעדכנת בכל דירה שלא שינתה את הערך",
  PROJECT_TYPE: "סוג פרויקט",
  ADDRESS: "כתובת הבניין",
  PARENT_NOTES: "הערות האב",
  TAMA_BADGE: "תמ״א",
  NO_NOTES: "אין הערות לבניין",
  STAGES_TITLE: "דירות לפי שלב",
  STAGES_SUBTITLE: "לחיצה על שלב מסננת את הטבלה",
  APARTMENTS_TITLE: "דירות הבניין",
  SEARCH_PLACEHOLDER: "חיפוש לפי מספר דירה, לקוח או קוד...",
  EMPTY_TITLE: "עדיין אין דירות בבניין הזה",
  EMPTY_DESCRIPTION: "הוסף דירה ראשונה. כל דירה תירש מהבניין את סוג הפרויקט, הכתובת וההערות.",
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
  CONTACT_TITLE: "אנשי קשר וצוות",
  CONTACT_SUBTITLE: "אנשי הקשר מתוך כרטיס הלקוח · הצוות נקבע לכל דירה בנפרד",
  CONTACT_NAME: "איש קשר היסטורי בדירה",
  CONTACT_PHONE: "טלפון נייד",
  INHERITED_TITLE: "נתונים מהפרויקט האב",
  INHERITED_SUBTITLE: "סוג הפרויקט והכתובת מתעדכנים עם פרויקט האב",
  PROJECT_TYPE: "סוג פרויקט",
  ADDRESS: "כתובת הבניין",
  UNIT: "קומה ומספר דירה",
  UNIT_SUB: "מתווספים לכתובת הבניין",
  LOCKED_TYPE: "🔒 לא ניתן לשינוי בדירה",
  LOCKED_ADDRESS: "🔒 לא ניתן לשינוי · מזהה המקום של Google נשאר של הבניין",
  EDITABLE_HERE: "ניתן לעריכה בדירה זו",
  CANCEL: "ביטול",
  PARENT_NOTES_TITLE: "הערות הפרויקט האב",
  READ_ONLY: "קריאה בלבד",
  PASSES_TO_ALL: "עוברת אוטומטית לכל דירה",
  OPEN_PARENT: "פתח בפרויקט האב ‹",
  NOTES_TITLE: "הערות הדירה",
  NOTES_SUBTITLE: "נראות רק בדירה זו",
  NOTES_PLACEHOLDER: "לדוגמה: הדייר זמין רק אחר הצהריים, גישה דרך חדר המדרגות המזרחי",
  NOTES_SAVED: "ההערות נשמרו",
  SAVE_NOTES: "שמור הערות",
  WAITING_REASON_CONTEXT: "יש לפרט למה או למי הדירה ממתינה. הסיבה תוצג בעמוד הדירה ובציר הזמן.",
} as const;

export const ADD_APARTMENT_COPY = {
  TITLE: "הוספת דירה",
  DESCRIPTION: "רק הפרטים של הדירה. כל השאר עובר מהבניין.",
  UNIT_TITLE: "פרטי הדירה",
  PEOPLE_TITLE: "לקוח הדירה *",
  PEOPLE_SUBTITLE: "בחירת לקוח קיים. איש הקשר והטלפון נלקחים מכרטיס הלקוח ולא מוקלדים מחדש",
  INHERITED_TITLE: "עובר מהבניין",
  INHERITED_SUBTITLE: "סוג הפרויקט והכתובת נשמרים מפרויקט האב",
  FROM_PARENT: "מפרויקט האב",
  TYPE_LABEL: "סוג פרויקט",
  ADDRESS_LABEL: "כתובת הבניין",
  NOT_CHANGEABLE: "לא ניתן לשינוי",
  ADDRESS_NOTE: "לא ניתן לשינוי · מוסיפים קומה ומספר דירה",
  NOTES_LABEL: "הערות האב",
  NOTES_NOTE: "יופיעו בדירה בקריאה בלבד",
  HAS_NOTES: "כולל תמ״א",
  NO_NOTES: "אין הערות",
  CANCEL: "ביטול",
  SUBMIT: "הוסף דירה",
  FIX_FIELDS: "יש שדות לתיקון לפני השמירה",
} as const;

export const APARTMENT_TEAM_COPY = {
  TITLE: "צוות הדירה",
  DESCRIPTION: "עובד ההנדסה נקבע לדירה. שאר הצוות עובר מהבניין עד לשינוי בדירה.",
  ENGINEER: "עובד הנדסה בדירה",
  NO_ENGINEER: "ללא עובד הנדסה",
  OTHER_TEAM: "שאר צוות הדירה",
  INHERITED: "עובר מהבניין",
  OWN: "שונה בדירה זו",
  OVERRIDE: "שנה לדירה זו",
  RESET: "חזור לשאר צוות הבניין",
  ADD: "הוסף חבר צוות…",
  REMOVE: "הסר חבר צוות",
  EMPTY: "לדירה אין צוות. הוסף חבר צוות או חזור לצוות הבניין.",
  EMPTY_PARENT: "עדיין לא הוגדר צוות בבניין",
  LOADING: "טוען חברי צוות…",
  RETRY: "נסה שוב",
  SAVE: "שמור צוות",
  NEW_CUSTOMER: "+ לקוח חדש",
  INVALID_CUSTOMER: "בחר לקוח לדירה לפני השמירה",
} as const;

export const APARTMENT_LIGHTING_COPY = {
  TITLE: "הנמכה כללית לתאורה",
  SUBTITLE: "הגובה עובר מהבניין כל עוד לא שונה בדירה",
  FORM_SUBTITLE: "הדירה כוללת הנמכת תקרה כללית לצורכי תאורה",
  OVERRIDE: "שנה לדירה זו",
  RESET: "חזור לערך הבניין",
  SAVE: "שמור הנמכה",
  DISABLED: "אין הנמכה כללית",
  VALUE_LABEL: "הנמכה בדירה",
} as const;
