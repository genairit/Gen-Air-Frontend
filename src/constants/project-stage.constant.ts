import { FIELD_INPUT_LIMITS } from "./field-validation.constant";

export const WAITING_FOR_RESPONSE_STAGE_ID = "6502a045-2a7d-4bc8-8ba1-36eaedc49a06";

export const STAGE_REASON_FIELD_ID = "stage-reason";

const WAITING_FOR_RESPONSE_STAGE_NAME = "מחכה לתשובה";

export const STAGE_REASON_COPY = {
  STAGE_NAME: WAITING_FOR_RESPONSE_STAGE_NAME,
  TITLE: `העברה לשלב ״${WAITING_FOR_RESPONSE_STAGE_NAME}״`,
  LABEL: "סיבת ההמתנה",
  HELPER: `עד ${FIELD_INPUT_LIMITS.STAGE_NOTE_CHARACTERS} תווים`,
  CANCEL: "ביטול",
  CONFIRM: "אישור והעברה",
  REQUIRED_ERROR: "יש להזין סיבה להמתנה",
  PLACEHOLDER: "לדוגמה: ממתינים לאישור התוכנית מהאדריכל",
  BANNER_TITLE: "סיבת ההמתנה",
  BANNER_EMPTY: "לא תועדה סיבה",
  BANNER_UPDATED_PREFIX: "עודכן",
  TIMELINE_LABEL: "סיבה:",
  ARCHIVED_STAGE: "שלב בארכיון",
} as const;

export const STAGE_REASON_SLOT_PROPS = {
  htmlInput: { "aria-required": true, "aria-label": STAGE_REASON_COPY.LABEL },
} as const;
