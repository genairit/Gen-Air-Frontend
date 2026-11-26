export const ESTIMATE_ENDPOINT = "/engineering-estimates";
export const ESTIMATE_QUERY_KEY = "engineering-estimates";
export const ESTIMATE_PARAM = "estimate";

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
