import type {
  ICustomerSyncFilter,
  ICustomerDetailField,
  TCustomerSyncStepState,
} from "../interfaces/customer.interface";

import { ICON_NAMES, type IconNameType } from "./icon.constant";
import { CHIP_VARIANTS, type ChipVariantType } from "./chip.constant";
import type { ICustomerQuery } from "../interfaces/api-request.interface";
import type { ProjectDetailFieldSetType } from "./project-detail-field-set.constant";
import { PRIORITY_SYNC_STATUSES, type PrioritySyncStatusType } from "./priority-sync.constant";

export const ALL_CUSTOMERS_FILTER_ID = "all";

export const CUSTOMER_PAGE_SIZE = 7;

export const CUSTOMERS_COPY = {
  TITLE: "לקוחות",
  EYEBROW: "לקוחות · ניהול ב-CRM",
  DESCRIPTION:
    "לקוח הוא הבעלים של פרויקטים ובניינים. דיירי דירות מנוהלים בתוך הדירה ולא מופיעים כאן.",
  SEARCH_PLACEHOLDER: "חיפוש לפי שם, ח.פ, איש קשר, טלפון או מזהה Priority...",
  LOADING: "טוען לקוחות...",
  EMPTY: "לא נמצאו לקוחות שמתאימים לחיפוש או לסינון",
  NO_PRIORITY_ID: "ללא מזהה Priority",
  NEXT_PAGE: "העמוד הבא",
  PREVIOUS_PAGE: "העמוד הקודם",
} as const;

export const CUSTOMER_TABLE_HEADERS = {
  CUSTOMER: "לקוח",
  CONTACT: "איש קשר",
  SYNC: "סנכרון Priority",
} as const;

export const CUSTOMER_SYNC_FILTERS: ICustomerSyncFilter[] = [
  { id: ALL_CUSTOMERS_FILTER_ID, label: "הכל", status: null },
  { id: PRIORITY_SYNC_STATUSES.SYNCED, label: "מסונכרן", status: PRIORITY_SYNC_STATUSES.SYNCED },
  { id: PRIORITY_SYNC_STATUSES.PENDING, label: "ממתין", status: PRIORITY_SYNC_STATUSES.PENDING },
  { id: PRIORITY_SYNC_STATUSES.FAILED, label: "נכשל", status: PRIORITY_SYNC_STATUSES.FAILED },
];

interface ISyncChipConfig {
  label: string;
  icon: IconNameType;
  variant: ChipVariantType;
}

export const SYNC_CHIP_BY_STATUS: Record<PrioritySyncStatusType, ISyncChipConfig> = {
  synced: { label: "מסונכרן", icon: ICON_NAMES.DONE, variant: CHIP_VARIANTS.ALERT },
  pending: { label: "ממתין ל-Priority", icon: ICON_NAMES.PENDING, variant: CHIP_VARIANTS.INSET },
  failed: { label: "נכשל בסנכרון", icon: ICON_NAMES.URGENT, variant: CHIP_VARIANTS.DARK },
};

export const TAX_ID_LABEL_BY_CUSTOMER_TYPE: Record<ProjectDetailFieldSetType, string> = {
  company: "ח.פ",
  institution: "מ״ע",
  private_client: "ת.ז",
};

export const CUSTOMER_PAGE_COPY = {
  LOADING: "טוען לקוח...",
  NOT_FOUND_TITLE: "הלקוח לא נמצא",
  CREATED_BY: "נוצר ע״י",
  DETAILS_TITLE: "פרטי הלקוח",
  DETAILS_SUBTITLE: "שדות הזהות ואיש הקשר של הלקוח",
  SYNC_TITLE: "סנכרון עם Priority",
  PRIORITY_ID: "מזהה Priority",
  LAST_SYNCED: "סונכרן לאחרונה",
  FAILED_TITLE: "הלקוח לא הגיע ל-Priority",
  FAILED_NOTE: "עד שהסנכרון יצליח אי אפשר להפיק ללקוח הצעות מחיר והזמנות ב-Priority.",
  PENDING_NOTE: "הלקוח שמור ב-CRM וזמין לשיוך לפרויקטים. הסנכרון עם Priority יתווסף בהמשך.",
} as const;

export const CUSTOMER_SYNC_SUBTITLE_BY_STATUS: Record<PrioritySyncStatusType, string> = {
  synced: "הלקוח קיים ב-Priority וב-CRM",
  pending: "שמור ב-CRM · ממתין לסנכרון עתידי",
  failed: "הלקוח שמור ב-CRM בלבד",
};

export const CUSTOMER_DETAIL_FIELDS: ICustomerDetailField[] = [
  { field: "name", label: "שם הלקוח", isLtr: false },
  { field: "taxId", label: "ח.פ / ת.פ / ת.ז", isLtr: true },
  { field: "address", label: "כתובת", isLtr: false },
  { field: "contactName", label: "איש קשר ראשי", isLtr: false },
  { field: "phone", label: "טלפון", isLtr: true },
  { field: "email", label: "דוא״ל", isLtr: true },
];

export const CUSTOMER_SYNC_STEP_TITLES = {
  PRIORITY: "שמירה ב-Priority",
  CRM: "שמירה ב-CRM",
} as const;

export const SYNC_STEP_ICON_BY_STATE: Record<TCustomerSyncStepState, IconNameType | null> = {
  done: ICON_NAMES.DONE,
  active: null,
  waiting: null,
  failed: null,
};

export const CUSTOMER_PICKER_RESULT_LIMIT = 5;

export const CUSTOMER_PICKER_COPY = {
  TITLE: "לקוח הפרויקט",
  SUBTITLE: "בחירת לקוח קיים. הפרטים נשמרים בכרטיס הלקוח ולא מוקלדים מחדש",
  SEARCH_PLACEHOLDER: "חיפוש לקוח לפי שם, ח.פ, איש קשר או טלפון...",
  RECENT: "לקוחות אחרונים",
  RESULTS: "תוצאות חיפוש",
  NO_RESULTS: "לא נמצא לקוח שמתאים לחיפוש",
  BLOCKED: "לא ניתן לבחור עד שיסונכרן ל-Priority",
  REQUIRED: "בחר לקוח לפרויקט לפני השמירה",
  LOADING: "טוען לקוחות...",
  OPEN_CUSTOMER: "כרטיס הלקוח",
  REPLACE: "החלף לקוח",
  NOT_SELECTED: "לא נבחר לקוח",
} as const;

export const ALL_CUSTOMERS_QUERY: ICustomerQuery = { search: "", prioritySyncStatus: null };
