import type {
  IChipSample,
  IDepthSample,
  IColorSwatch,
  ITypographySample,
} from "../interfaces/showcase.interface";

import { theme } from "./theme.constants";
import { TIME_UNITS } from "./date.constants";
import { AVATAR_TONES } from "./tone.constant";
import { SURFACE_DEPTHS } from "./surface.constant";
import { CHIP_SIZES, CHIP_VARIANTS } from "./chip.constant";
import type { IPerson } from "../interfaces/person.interface";
import type { ITabItem } from "../interfaces/tab-item.interface";
import type { IChecklistTask } from "../interfaces/project.interface";
import type { INavigationItem } from "../interfaces/navigation-item.interface";

const { palette } = theme;

export const SHOWCASE_COLOR_SWATCHES: IColorSwatch[] = [
  { name: "Deep Charcoal", color: palette.charcoal, usage: "סרגל ניווט וטיפוגרפיה ראשית" },
  {
    isInsetPreview: true,
    name: "Soft Ice White",
    color: palette.iceWhite,
    usage: "רקע סביבת העבודה וכרטיסים",
  },
  { name: "Genair Blue", color: palette.primary, usage: "פעולה ראשית והתראות קריטיות בלבד" },
  { name: "Air Blue", color: palette.airBlue, usage: "טאבים פעילים, משני, התקדמות, סטטוס חיובי" },
];

export const SHOWCASE_TYPOGRAPHY_SAMPLES: ITypographySample[] = [
  { label: "כותרת עמוד 40", fontSize: 40, fontWeight: 800 },
  { label: "כותרת כרטיס 24", fontSize: 24, fontWeight: 700 },
  { label: "כותרת משנה 18", fontSize: 18, fontWeight: 600 },
  { label: "טקסט גוף 15 — תיאור פרויקט, הערות טכנאי ותוכן כללי.", fontSize: 15, fontWeight: 400 },
];

export const SHOWCASE_DEPTH_SAMPLES: IDepthSample[] = [
  { label: "מובלט", depth: SURFACE_DEPTHS.RAISED },
  { label: "מובלט עדין", depth: SURFACE_DEPTHS.RAISED_SOFT },
  { label: "שקוע", depth: SURFACE_DEPTHS.INSET },
];

export const SHOWCASE_STATUS_CHIPS: IChipSample[] = [
  {
    label: "בביצוע פעיל",
    size: CHIP_SIZES.MEDIUM,
    variant: CHIP_VARIANTS.INFO,
    dotColor: palette.statusBlue,
  },
  {
    label: "הצעת מחיר",
    size: CHIP_SIZES.MEDIUM,
    variant: CHIP_VARIANTS.RAISED,
    dotColor: palette.statusGray,
  },
  {
    label: "הזמנה",
    size: CHIP_SIZES.MEDIUM,
    variant: CHIP_VARIANTS.RAISED,
    dotColor: palette.charcoal,
  },
  {
    label: "חריגה בתקציב",
    size: CHIP_SIZES.MEDIUM,
    variant: CHIP_VARIANTS.ALERT,
    dotColor: palette.white,
  },
  { label: "מסונכרן ומאובטח", size: CHIP_SIZES.MEDIUM, variant: CHIP_VARIANTS.INFO },
];

export const SHOWCASE_TYPE_TAGS: IChipSample[] = [
  { label: "בנייה רוויה", variant: CHIP_VARIANTS.INSET },
  { label: "מסחרי (VRF)", variant: CHIP_VARIANTS.INSET },
  { label: "דירות יוקרה", variant: CHIP_VARIANTS.INSET },
  { label: "טכני", variant: CHIP_VARIANTS.DARK },
  { label: "GA-84920", isMonospace: true, variant: CHIP_VARIANTS.INFO },
  { label: "7", variant: CHIP_VARIANTS.DARK },
];

export const EMPLOYEE_FILTER_TABS: ITabItem[] = [
  { id: "all", label: "הכל", count: 48 },
  { id: "admins", label: "מנהלי מערכת", count: 4 },
  { id: "secretaries", label: "מזכירות", count: 7 },
  { id: "managers", label: "מנהלי פרויקטים", count: 11 },
  { id: "installers", label: "מתקינים", count: 26 },
];

export const PROJECT_VIEW_TABS: ITabItem[] = [
  { id: "checklist", label: "צ׳קליסט דינמי" },
  { id: "drive", label: "מסמכי Drive" },
  { id: "log", label: "יומן טכנאי" },
];

export const FIELD_DAY_TABS: ITabItem[] = [
  { id: "checklist", label: "צ׳קליסט" },
  { id: "documents", label: "מסמכים" },
  { id: "log", label: "יומן" },
];

export const SIDEBAR_ITEMS: INavigationItem[] = [
  { id: "dashboard", label: "לוח בקרה" },
  { id: "employees", label: "ניהול עובדים" },
  { id: "settings", label: "הגדרות" },
];

export const MOBILE_NAV_ITEMS: INavigationItem[] = [
  { id: "board", label: "לוח" },
  { id: "projects", label: "פרויקטים" },
  { id: "log", label: "יומן" },
  { id: "profile", label: "פרופיל" },
];

export const SHOWCASE_CURRENT_USER: IPerson = {
  initials: "אכ",
  name: "אביעד כהן",
  caption: "מנהל פרויקטים ראשי",
};

export const SHOWCASE_TOP_BAR_USER: IPerson = {
  ...SHOWCASE_CURRENT_USER,
  avatarTone: AVATAR_TONES.CHARCOAL,
};

export const PROJECT_STATUS_OPTIONS = ["הצעת מחיר", "הזמנה", "בביצוע", "מסירה/שירות"];

export const MANAGER_FILTER_OPTIONS = ["כל המנהלים", "אביעד כהן", "דוד בן שחר", "יוסי בראון"];

export const STAGE_FILTER_OPTIONS = ["שלב (הכל)", ...PROJECT_STATUS_OPTIONS];

export const FIELD_CHECKLIST_TASKS: IChecklistTask[] = [
  { id: "pressure-test", label: "בדיקת לחץ צנרת — 40 בר" },
  { id: "gas-insulation", label: "בידוד קווי גז" },
  { id: "indoor-units", label: "חיבור יחידות פנים" },
  { id: "documentation", label: "צילום ותיעוד לתיק" },
];

export const FIELD_CHECKLIST_INITIAL_STATE: Record<string, boolean> = {
  "pressure-test": true,
  "gas-insulation": true,
  "indoor-units": false,
  documentation: false,
};

export const FIELD_USER: IPerson = {
  initials: "רל",
  name: "רומן לוין",
  caption: "מתקין ראשי",
  avatarTone: AVATAR_TONES.CHARCOAL,
};

export const FREE_TEXT_ENDPOINT = "http://localhost:4000";

export const SIMULATED_REQUEST_DELAY_MS = 0.6 * TIME_UNITS.SECONDS;

export const SHOWCASE_PAGE_COUNT = 3;
