import Decimal from "decimal.js";
import { TIME_UNITS } from "./time.constant";
import { BUTTON_SIZES, BUTTON_SHAPES } from "../components/Button/constants/button.constants";

export const QUOTATION_STATUS = {
  DRAFT: "draft",
  REVIEW: "review",
  APPROVED: "approved",
  CANCELLED: "cancelled",
} as const;
export const QUOTATION_CANCELLATION_KIND = {
  MANUAL: "manual",
} as const;
export const QUOTATION_CONFIRMATION = {
  CANCEL: "cancel",
  RESTORE: "restore",
} as const;
export const QUOTATION_COMMAND = {
  TRANSITION: "transition",
  CANCEL: "cancel",
  RESTORE: "restore",
  SALES_AGENT: "sales-agent",
  ACKNOWLEDGE: "acknowledge",
  RELOAD: "reload",
} as const;
export const QUOTATION_ALL_TAB_ID = "all";
export const MAX_QUOTATION_CANCELLATION_REASON_LENGTH = 1000;
export const QUOTATION_GENERAL_TAB_ID = "__general__";
export const QUOTATION_SYSTEM = {
  VRF: "VRF",
  MULTI: "MULTI",
  SINGLE: "SINGLE",
  GENERAL: "GEN",
} as const;
export const EQUIPMENT_ROLE = {
  INDOOR: "indoor",
  OUTDOOR: "outdoor",
  UNIT: "unit",
  CONTROL: "control",
  CENTRAL: "central",
  HEADER: "header",
  PIPE: "pipe",
  OTHER: "other",
} as const;
export const CONTROL_KIND = { REMOTE: "remote", THERMOSTAT: "thermostat" } as const;
export const CATALOGUE_STATUS = {
  ACTIVE: "active",
  ARCHIVED: "archived",
  NO_SELL: "nosell",
  CONFLICT: "conflict",
} as const;
export type TQuotationStatus = (typeof QUOTATION_STATUS)[keyof typeof QUOTATION_STATUS];
export type TQuotationRestorableStatus = Exclude<
  TQuotationStatus,
  typeof QUOTATION_STATUS.CANCELLED
>;
export type TQuotationCancellationKind =
  (typeof QUOTATION_CANCELLATION_KIND)[keyof typeof QUOTATION_CANCELLATION_KIND];
export type TQuotationConfirmation =
  (typeof QUOTATION_CONFIRMATION)[keyof typeof QUOTATION_CONFIRMATION];
export type TQuotationCommand = (typeof QUOTATION_COMMAND)[keyof typeof QUOTATION_COMMAND];
export type TQuotationSystem = (typeof QUOTATION_SYSTEM)[keyof typeof QUOTATION_SYSTEM];
export const QUOTATION_STATUS_LABELS = {
  [QUOTATION_STATUS.DRAFT]: "טיוטה",
  [QUOTATION_STATUS.REVIEW]: "בבדיקה",
  [QUOTATION_STATUS.APPROVED]: "הזמנה",
  [QUOTATION_STATUS.CANCELLED]: "מבוטלת",
} as const;
export const QUOTATION_SYSTEM_LABELS = {
  VRF: "מערכת VRF",
  MULTI: "מולטי / VRF BOX",
  SINGLE: "סינגלים",
  GEN: "פריטים נוספים",
} as const;
export const QUOTATION_STATUS_TABS = [
  { key: null, label: "הכל" },
  ...Object.values(QUOTATION_STATUS).map(key => ({ key, label: QUOTATION_STATUS_LABELS[key] })),
];
export const QUOTATION_SYSTEM_OPTIONS = Object.values(QUOTATION_SYSTEM).map(value => ({
  value,
  label: QUOTATION_SYSTEM_LABELS[value],
}));
export const QUOTATION_ROLE_OPTIONS = [
  { value: EQUIPMENT_ROLE.INDOOR, label: "יחידה פנימית" },
  { value: EQUIPMENT_ROLE.OUTDOOR, label: "מעבה" },
  { value: EQUIPMENT_ROLE.UNIT, label: "מזגן" },
  { value: EQUIPMENT_ROLE.CONTROL, label: "טרמוסטט / שלט" },
  { value: EQUIPMENT_ROLE.HEADER, label: "חנוכיה" },
  { value: EQUIPMENT_ROLE.PIPE, label: "צנרת" },
  { value: EQUIPMENT_ROLE.OTHER, label: "פריט נוסף" },
];
export const QUOTATION_EQUIPMENT_ROLES = [
  EQUIPMENT_ROLE.INDOOR,
  EQUIPMENT_ROLE.OUTDOOR,
  EQUIPMENT_ROLE.UNIT,
];
export const QUOTATION_TYPES = {
  INDOOR: [
    "לחץ בינוני",
    "לחץ נמוך",
    "לחץ גבוה",
    "נסתר צר / זריקה ישירה",
    "עילי",
    "קסטה",
    "אנכי",
    "אוויר צח",
  ],
  OUTDOOR: ["רגיל (HP)", "מיני VRF", "שיחזור חום (HR)"],
  SINGLE: ["עילי", "מיני מרכזי", "נסתר צר / זריקה ישירה", "נייד"],
};
export const QUOTATION_CIRCUITS = "ABCDEFGHIJ".split("");
export const QUOTATION_QUERY_KEY = ["quotations"] as const;
export const QUOTATION_DETAIL_KEY = (id: string) => ["quotation", id];
export const QUOTATION_CATALOGUE_KEY = "quotation-catalogue";
export const QUOTATION_PROJECTS_KEY = "quotation-projects";
export const QUOTATION_AUTOSAVE_MS = 0.8 * TIME_UNITS.SECOND_MS;
export const QUOTATION_BRANDS = [
  "אלקטרה",
  "תדיראן",
  "טורנדו",
  "סמסונג",
  "LG",
  "דייקין",
  "מיצובישי אלקטריק",
  "מיצובישי HEAVY",
  "טושיבה",
  "הייסנס",
  "אמקור",
  "אוקס",
  "אופיט",
  "פוג'יסטו",
];
export const QUOTATION_DECIMAL = Decimal.clone({ precision: 50, rounding: Decimal.ROUND_HALF_UP });

export const QUOTATION_COUNTS_KEY = [...QUOTATION_QUERY_KEY, "status-counts"] as const;
export const QUOTATION_SALES_AGENTS_KEY = [...QUOTATION_QUERY_KEY, "sales-agents"] as const;
export const QUOTATION_STEPS = [
  { status: QUOTATION_STATUS.DRAFT, label: "טיוטה" },
  { status: QUOTATION_STATUS.REVIEW, label: "בדיקה" },
  { status: QUOTATION_STATUS.APPROVED, label: "הזמנה" },
];

export const QUOTATION_DEFAULTS = { CIRCUIT: "A" } as const;

export const QUOTATION_INPUT_REASON = { INPUT: "input", CLEAR: "clear" } as const;

export const QUOTATION_BUTTON_HEIGHT = {
  [BUTTON_SIZES.COMPACT]: { [BUTTON_SHAPES.PILL]: 34, [BUTTON_SHAPES.CIRCLE]: 36 },
  [BUTTON_SIZES.MEDIUM]: { [BUTTON_SHAPES.PILL]: 52, [BUTTON_SHAPES.CIRCLE]: 52 },
  [BUTTON_SIZES.LARGE]: { [BUTTON_SHAPES.PILL]: 52, [BUTTON_SHAPES.CIRCLE]: 52 },
} as const;

export const QUOTATION_PRIMARY_DISABLED_STYLE = {
  "&.Mui-disabled": { color: "#fff", backgroundColor: "#1f7fdb", opacity: 0.45 },
} as const;
export const QUOTATION_ROW_COPY = {
  CUSTOMER: "לקוח",
  NO_PROJECT: "לא מקושרת לפרויקט",
  GENERAL: "כללי",
} as const;
