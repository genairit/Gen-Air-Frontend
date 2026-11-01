export const CUSTOMER_PROJECT_KINDS = {
  BUILDING: "building",
  PROJECT: "project",
  APARTMENT: "apartment",
} as const;

export type CustomerProjectKindType =
  (typeof CUSTOMER_PROJECT_KINDS)[keyof typeof CUSTOMER_PROJECT_KINDS];

export const CUSTOMER_PROJECT_PAGINATION = {
  INITIAL_SIZE: 8,
  NEXT_SIZE: 10,
  SCROLL_MARGIN: "0px",
} as const;

export const CUSTOMER_PROJECT_DISPLAY = {
  SKELETON_ROWS: 4,
  TABLE_MIN_WIDTH: 900,
  SCROLL_MAX_HEIGHT: "max(360px, calc(100vh - 380px))",
} as const;

export const CUSTOMER_PROJECT_SKELETON_ROWS = Array.from(
  { length: CUSTOMER_PROJECT_DISPLAY.SKELETON_ROWS },
  (_, index) => index,
);

export const CUSTOMER_PROJECT_COPY = {
  TITLE: "פרויקטים של הלקוח",
  SEARCH: "חיפוש לפי שם או מזהה",
  LOADING: "טוען את פרויקטי הלקוח...",
  LOADING_MORE: "טוען עוד פרויקטים…",
  ERROR: "לא הצלחנו לטעון את הפרויקטים",
  ERROR_DESCRIPTION: "שאר פרטי הלקוח זמינים. אפשר לנסות שוב בלי לרענן את הדף.",
  RETRY: "נסה שוב",
  EMPTY: "עדיין אין פרויקטים ללקוח הזה",
  EMPTY_DESCRIPTION:
    "פרויקט, בניין או דירה יופיעו כאן ברגע שישויכו ללקוח. פרויקטים נוצרים ממסך הפרויקטים.",
  NO_RESULTS: "אין תוצאות לסינון הזה",
  CLEAR: "נקה סינון",
  MORE: "טען עוד פרויקטים",
  BUILDING: "בניין",
  APARTMENT: "דירה",
  FLOOR: "קומה",
} as const;
