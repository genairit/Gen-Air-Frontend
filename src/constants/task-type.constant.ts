import { CHIP_VARIANTS } from "./chip.constant";

export const TASK_TYPES = {
  QUOTATION: "quotation",
  PLANNING: "planning",
  GENERAL: "general",
} as const;
export type TaskType = (typeof TASK_TYPES)[keyof typeof TASK_TYPES];
export const TASK_TYPE_VALUES = Object.values(TASK_TYPES);
export const TASK_TYPE_LABELS: Record<TaskType, string> = {
  quotation: "הצעת מחיר",
  planning: "תכנון",
  general: "כללי",
};
export const TASK_TYPE_CHIP_VARIANTS = {
  quotation: CHIP_VARIANTS.INFO,
  planning: CHIP_VARIANTS.INSET,
  general: CHIP_VARIANTS.INSET,
} as const;
export const PROJECT_TASK_COPY = {
  TYPE: "סוג משימה",
  GENERAL_HELP: "משימות הצעת מחיר ותכנון נוצרות אוטומטית עם הפרויקט. כאן אפשר להוסיף משימה כללית.",
  PROTECTED_HELP: "משימת פרויקט קבועה — לעבודה נוספת מחזירים את אותה משימה לבעבודה.",
} as const;
