import { USER_ROLES } from "./user-role.constant";
import type { IUserQuery } from "../interfaces/api-request.interface";

export const ALL_OPTION_ID = "";

export const BOARD_FILTER_ALL = {
  STAGES: "שלב (הכל)",
  TYPES: "סוג פרויקט (כל הסוגים)",
  MANAGERS: "כל המנהלים",
} as const;

export const BOARD_COPY = {
  NEW_PROJECT: "פרויקט חדש",
  EMPTY_COLUMN: "גרור פרויקט לכאן",
  LOADING: "טוען את לוח הפרויקטים...",
  SEARCH_PLACEHOLDER: "חיפוש פרויקטים, מזהה או קבלן...",
} as const;

export const PROJECT_MANAGERS_QUERY: IUserQuery = { search: "", role: USER_ROLES.PROJECT_MANAGER };
