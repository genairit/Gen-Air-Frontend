import { USER_ROLES } from "./user-role.constant";
import type { IUserQuery } from "../interfaces/api-request.interface";

export const ALL_OPTION_ID = "";

export const PROJECT_BOARD_PAGE_SIZE = 25;

export const PROJECT_BOARD_SCROLL_ROOT_MARGIN = "200px";

export const BOARD_FILTER_ALL = {
  TYPES: "סוג פרויקט (כל הסוגים)",
  MANAGERS: "כל המנהלים",
} as const;

export const BOARD_COPY = {
  NEW_PROJECT: "פרויקט חדש",
  LOADING: "טוען את לוח הפרויקטים...",
  LOADING_MORE: "טוען עוד פרויקטים...",
  SEARCH_PLACEHOLDER: "חיפוש לפי פרויקט, מזהה או לקוח...",
  STAGES_TITLE: "פרויקטים לפי שלב",
  STAGES_SUBTITLE: "לחיצה על שלב מסננת את הטבלה",
  NO_RESULTS: "לא נמצאו פרויקטים שמתאימים לחיפוש או לסינון",
  NO_CUSTOMER: "—",
} as const;

export const PROJECT_TABLE_HEADERS = {
  PROJECT: "פרויקט",
  TYPE: "סוג",
  CUSTOMER: "לקוח",
  STAGE: "שלב",
  TEAM: "צוות",
  UPDATED: "עודכן",
} as const;

export const PROJECT_MANAGERS_QUERY: IUserQuery = { search: "", role: USER_ROLES.PROJECT_MANAGER };
