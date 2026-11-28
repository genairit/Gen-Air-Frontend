export const ESTIMATE_ENDPOINT = "/engineering-estimates";
export const ESTIMATE_QUERY_KEY = "engineering-estimates";
export const ESTIMATE_PARAM = "estimate";
export const ESTIMATE_CREATE_PROJECT_PARAM = "createForProject";

export const ESTIMATE_SCOPE_LABELS = {
  hvac: "מיזוג בלבד",
  hvac_ventilation: "מיזוג ואוורור",
  installation_only: "התקנה בלבד",
  hvac_floor_heating: "מיזוג וחימום תת־רצפתי",
} as const;

export const ESTIMATE_SETUP = {
  PROJECT: "project",
  PLANS: "plans",
  SCOPE: "scope",
  AREAS: "areas",
  COMPLETE: "complete",
} as const;

export const ESTIMATE_STATUS_LABELS = {
  draft: "טיוטה",
  sketch: "סקיצה לבדיקה",
  approved: "מאושר",
} as const;

export const ESTIMATE_SETUP_PROMPTS = {
  [ESTIMATE_SETUP.PROJECT]: "לאיזה פרויקט לשייך את כתב הכמויות?",
  [ESTIMATE_SETUP.PLANS]: "אילו תוכניות נצרף לכתב הכמויות?",
  [ESTIMATE_SETUP.SCOPE]: "מה היקף העבודה?",
  [ESTIMATE_SETUP.AREAS]: "הוסיפו טיפוסי דירות או אזורים וכמה פעמים כל אחד חוזר.",
  [ESTIMATE_SETUP.COMPLETE]: "הטיוטה נשמרה. אפשר לעבור לעריכת הכמויות והתמחור.",
} as const;

export const ESTIMATE_EQUIPMENT_LABELS = {
  other: "ללא תוספת ציוד",
  "mini-central": "מיני מרכזי",
  "vrf-wall": "מאייד עילי VRF",
  "vrf-concealed": "מאייד נסתר VRF",
  "vrf-cassette": "קסטה VRF",
  "vrf-outdoor": "מעבה VRF",
} as const;

export const ESTIMATE_DISTRIBUTION_LABELS = {
  none: "ללא תעלות או מרכזיה",
  manifold: "מרכזיה",
  duct: "תעלת פח",
} as const;

export const ESTIMATE_MAX_PLAN_BYTES = 4 * 1024 * 1024;
export const ESTIMATE_MAX_MARKED_BYTES = ESTIMATE_MAX_PLAN_BYTES / 8;

export const ESTIMATE_WORKSPACE_TAB = {
  QUANTITIES: "quantities",
  QUESTIONS: "questions",
} as const;

export const ESTIMATE_WORKSPACE_TABS = [
  { id: ESTIMATE_WORKSPACE_TAB.QUANTITIES, label: "כמויות ותמחור" },
  { id: ESTIMATE_WORKSPACE_TAB.QUESTIONS, label: "שאלות לבירור" },
];

export const ESTIMATE_SCOPE_OPTIONS = Object.entries(ESTIMATE_SCOPE_LABELS).map(
  ([value, label]) => ({ value, label }),
);
export const ESTIMATE_EQUIPMENT_OPTIONS = Object.entries(ESTIMATE_EQUIPMENT_LABELS).map(
  ([value, label]) => ({ value, label }),
);
export const ESTIMATE_DISTRIBUTION_OPTIONS = Object.entries(ESTIMATE_DISTRIBUTION_LABELS).map(
  ([value, label]) => ({ value, label }),
);

export const ESTIMATE_SHELTER_OPTIONS = [
  { value: "no", label: "ללא" },
  { value: "yes", label: "יש יציאת אספקה בממ״ד" },
];

export const ESTIMATE_PDF_TYPE = "application/pdf";
export const ESTIMATE_PLAN_TYPE_BY_EXTENSION = {
  pdf: ESTIMATE_PDF_TYPE,
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
} as const;

export const ESTIMATE_IMAGE_TYPES: readonly string[] = [
  ESTIMATE_PLAN_TYPE_BY_EXTENSION.png,
  ESTIMATE_PLAN_TYPE_BY_EXTENSION.jpeg,
];

export const ESTIMATE_NAME_MAX_LENGTH = 160;

export const ESTIMATE_DOCUMENT_PANEL = { EDITOR: "editor", PREVIEW: "preview" } as const;
export const ESTIMATE_DOCUMENT_PANELS = [
  { id: ESTIMATE_DOCUMENT_PANEL.EDITOR, label: "עריכה" },
  { id: ESTIMATE_DOCUMENT_PANEL.PREVIEW, label: "תצוגה מקדימה" },
];

export const ESTIMATE_EXPORT_COPY = {
  BUTTON: "ייצוא ל-Drive",
  BUSY: "מייצא ל-Drive...",
  SUCCESS: "כתב הכמויות נשמר בתיקיית כתבי כמויות בפרויקט ב-Drive",
  OPEN: "פתיחת הקובץ (בחלון חדש)",
  NO_PROJECT: "יש לשייך את כתב הכמויות לפרויקט כדי לייצא ל-Drive.",
  SAVE_FIRST: "שמרו או בטלו את העריכה כדי לייצא את הגרסה השמורה.",
} as const;
