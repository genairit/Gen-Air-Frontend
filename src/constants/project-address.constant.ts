import {
  PROJECT_DETAIL_FIELD_SETS,
  type ProjectDetailFieldSetType,
} from "./project-detail-field-set.constant";

import { TIME_UNITS } from "./date.constants";
import { FIELD_INPUT_LIMITS } from "./field-validation.constant";

export const ADDRESS_FIELD_STATUSES = {
  IDLE: "idle",
  TYPING: "typing",
  VERIFIED: "verified",
  SUGGESTIONS: "suggestions",
  UNVERIFIED: "unverified",
} as const;

export type AddressFieldStatusType =
  (typeof ADDRESS_FIELD_STATUSES)[keyof typeof ADDRESS_FIELD_STATUSES];

export const SUGGESTION_LIST_STATES = {
  ERROR: "error",
  EMPTY: "empty",
  LOADING: "loading",
  RESULTS: "results",
} as const;

export type SuggestionListStateType =
  (typeof SUGGESTION_LIST_STATES)[keyof typeof SUGGESTION_LIST_STATES];

export const ADDRESS_SEARCH = {
  MIN_CHARACTERS: FIELD_INPUT_LIMITS.MIN_TEXT_LENGTH,
  DEBOUNCE_MS: 0.3 * TIME_UNITS.SECONDS,
} as const;

export const ADDRESS_CITY_REQUIRED_BY_FIELD_SET: Record<ProjectDetailFieldSetType, boolean> = {
  [PROJECT_DETAIL_FIELD_SETS.COMPANY]: false,
  [PROJECT_DETAIL_FIELD_SETS.INSTITUTION]: false,
  [PROJECT_DETAIL_FIELD_SETS.PRIVATE_CLIENT]: true,
};

export const PROJECT_ADDRESS_COPY = {
  SUBTITLE: "שדה חובה · הכתובת חייבת להיות מאומתת מול Google Maps",
  CITY_LABEL: "עיר",
  VERIFIED: "מאומתת",
  SOURCE: "Google Maps",
  UNVERIFIED: "לא מאומתת",
  CHANGE: "שנה כתובת",
  RETRY: "הצג הצעות",
  LABEL: "כתובת הפרויקט",
  LOADING: "מחפש כתובות…",
  CONFIRMING: "מאמת כתובת…",
  TYPE_MORE: "הקלד לפחות 2 תווים",
  TYPE_HINT: "רחוב, מספר ועיר",
  VERIFIED_TITLE: "כתובת מאומתת ע״י Google Maps",
  PLACEHOLDER: "התחל להקליד רחוב, מספר ועיר",
  LIST_FOOTER: "רק כתובת שנבחרה מהרשימה נחשבת מאומתת",
  FAIL_HINT: "בחר כתובת מרשימת ההצעות. טקסט חופשי לא יתקבל.",
  NO_RESULTS: "לא נמצאו כתובות תואמות. נסה לדייק רחוב, מספר ועיר.",
  REQUIRED_TITLE: "כתובת הפרויקט חובה — בחר כתובת מאומתת",
  UNMATCHED_TITLE: "לא הצלחנו לאמת את הכתובת שהוקלדה",
  SEARCH_FAILED: "חיפוש הכתובות נכשל. נסה שוב בעוד רגע.",
  CITY_REQUIRED_TITLE: "סוג פרויקט זה דורש כתובת בתוך עיר — בחר כתובת רחוב",
} as const;
