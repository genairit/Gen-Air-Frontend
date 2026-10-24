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
  NEW_TASK: "משימה חדשה",
  NEW_PROJECT: "פרויקט חדש",
  LOADING: "טוען את לוח הפרויקטים...",
  LOADING_MORE: "טוען עוד פרויקטים...",
  SEARCH_PLACEHOLDER: "חיפוש פרויקטים, מזהה או קבלן...",
  TABLE_TITLE: "פרויקטים",
  TABLE_SUBTITLE: "בניינים ופרויקטים עצמאיים בלבד · דירות נפתחות דרך הבניין",
  NO_RESULTS: "לא נמצאו פרויקטים שמתאימים לחיפוש או לשלב שנבחר",
  AUTO_LOAD_NOTE: "הרשימה נטענת אוטומטית בגלילה",
} as const;

export const PROJECT_TABLE_HEADERS = {
  PROJECT: "פרויקט",
  TYPE: "סוג",
  TEAM: "צוות",
  UPDATED: "עודכן",
  STAGE: "שלב",
} as const;

export const PROJECT_MANAGERS_QUERY: IUserQuery = { search: "", role: USER_ROLES.PROJECT_MANAGER };
