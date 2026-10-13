import { ICON_NAMES } from "./icon.constant";
import { ROUTE_PATHS } from "./routes.constant";
import type { IBackLinkTarget, INavigationItem } from "../interfaces/navigation-item.interface";

export const APP_NAVIGATION_ITEMS: INavigationItem[] = [
  { id: ROUTE_PATHS.BOARD, label: "לוח בקרה", icon: ICON_NAMES.PROJECTS },
  { id: ROUTE_PATHS.CUSTOMERS, label: "לקוחות", icon: ICON_NAMES.CUSTOMER },
  { id: ROUTE_PATHS.EMPLOYEES, label: "ניהול עובדים", icon: ICON_NAMES.CONTACTS },
  { id: ROUTE_PATHS.SETTINGS, label: "הגדרות", icon: ICON_NAMES.SETTINGS },
];

export const MOBILE_NAVIGATION_ITEMS: INavigationItem[] = [
  { id: ROUTE_PATHS.BOARD, label: "לוח", icon: ICON_NAMES.PROJECTS },
  { id: ROUTE_PATHS.CUSTOMERS, label: "לקוחות", icon: ICON_NAMES.CUSTOMER },
  { id: ROUTE_PATHS.EMPLOYEES, label: "עובדים", icon: ICON_NAMES.CONTACTS },
  { id: ROUTE_PATHS.SETTINGS, label: "הגדרות", icon: ICON_NAMES.SETTINGS },
  { id: ROUTE_PATHS.LOGIN, label: "יציאה", icon: ICON_NAMES.LOGOUT },
];

export const PAGE_TITLE_BY_ROUTE: Record<string, string> = {
  [ROUTE_PATHS.BOARD]: "ניהול פרויקטים ומשימות",
  [ROUTE_PATHS.PROJECT]: "תצוגת פרויקט",
  [ROUTE_PATHS.NEW_PROJECT]: "יצירת פרויקט חדש",
  [ROUTE_PATHS.EDIT_PROJECT]: "עריכת פרויקט",
  [ROUTE_PATHS.SETTINGS]: "הגדרות מערכת",
  [ROUTE_PATHS.EMPLOYEES]: "ניהול עובדים",
  [ROUTE_PATHS.CUSTOMERS]: "לקוחות",
  [ROUTE_PATHS.CUSTOMER]: "כרטיס לקוח",
  [ROUTE_PATHS.COMPONENTS]: "ספריית רכיבים",
};

export const ACTIVE_NAVIGATION_BY_ROUTE: Record<string, string> = {
  [ROUTE_PATHS.BOARD]: ROUTE_PATHS.BOARD,
  [ROUTE_PATHS.PROJECT]: ROUTE_PATHS.BOARD,
  [ROUTE_PATHS.NEW_PROJECT]: ROUTE_PATHS.BOARD,
  [ROUTE_PATHS.EDIT_PROJECT]: ROUTE_PATHS.BOARD,
  [ROUTE_PATHS.SETTINGS]: ROUTE_PATHS.SETTINGS,
  [ROUTE_PATHS.EMPLOYEES]: ROUTE_PATHS.EMPLOYEES,
  [ROUTE_PATHS.CUSTOMERS]: ROUTE_PATHS.CUSTOMERS,
  [ROUTE_PATHS.CUSTOMER]: ROUTE_PATHS.CUSTOMERS,
  [ROUTE_PATHS.COMPONENTS]: ROUTE_PATHS.BOARD,
};

export const BRAND = {
  TITLE: "GENAIR",
  SECTION_TITLE: "פלטפורמת תפעול",
} as const;

export const NAVIGATION_LABELS = {
  LOGOUT: "התנתק",
  BACK_TO_BOARD: "חזרה ללוח הבקרה",
  BACK_TO_CUSTOMERS: "חזרה ללקוחות",
} as const;

export const BACK_LINK_BY_ROUTE: Record<string, IBackLinkTarget> = {
  [ROUTE_PATHS.PROJECT]: { to: ROUTE_PATHS.BOARD, label: NAVIGATION_LABELS.BACK_TO_BOARD },
  [ROUTE_PATHS.CUSTOMER]: { to: ROUTE_PATHS.CUSTOMERS, label: NAVIGATION_LABELS.BACK_TO_CUSTOMERS },
};
