export const TASK_QUOTATION_KEYS = {
  ROOT: "task-quotations",
  context: (taskId: string, generation: number) => [TASK_QUOTATION_KEYS.ROOT, taskId, generation],
} as const;

export const TASK_QUOTATION_UNAVAILABLE = {
  WRONG_TASK_TYPE: "WRONG_TASK_TYPE",
  MISSING_CONTEXT: "MISSING_CONTEXT",
} as const;

export const TASK_QUOTATION_COPY = {
  TITLE: "הצעת מחיר משויכת",
  CREATE: "יצירת הצעת מחיר",
  LOADING: "טוען הצעות משויכות",
  RETRY: "ניסיון נוסף",
  EMPTY_READ: "אין עדיין הצעת מחיר משויכת למשימה.",
  EMPTY: "יצירת טיוטה ללקוח ולפרויקט של המשימה",
  CUSTOMER_ONLY: "יצירת טיוטה ללקוח של המשימה",
  BLOCKED: "יש לשייך לקוח ישירות לפרויקט לפני יצירת הצעה, ולוודא שהלקוח והפרויקט זמינים.",
  LOCKED: "ההצעה משויכת למשימה. פרטי ההקשר נשמרים בהתאם למשימה.",
} as const;
