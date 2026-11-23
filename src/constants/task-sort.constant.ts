import { NEW_TASK_COPY, TASKS_PAGE_COPY } from "./task.constant";

export const TASK_SORTS = {
  DEFAULT: "default",
  DUE_DATE_ASC: "due_date_asc",
  DUE_DATE_DESC: "due_date_desc",
} as const;

export type TaskSortType = (typeof TASK_SORTS)[keyof typeof TASK_SORTS];

export const TASK_SORT_VALUES: TaskSortType[] = Object.values(TASK_SORTS);

export const TASK_SORT_COPY = {
  LABEL: "מיון משימות",
  RETRY: NEW_TASK_COPY.RETRY,
} as const;

export const TASK_SORT_LABELS: Record<TaskSortType, string> = {
  default: "דחופות תחילה",
  due_date_asc: "תאריך יעד — הקרוב תחילה",
  due_date_desc: "תאריך יעד — הרחוק תחילה",
};

export const TASK_SORT_NOTES: Record<TaskSortType, string> = {
  default: TASKS_PAGE_COPY.ORDER_NOTE,
  due_date_asc: "תאריך יעד: הקרוב תחילה · ללא תאריך בסוף",
  due_date_desc: "תאריך יעד: הרחוק תחילה · ללא תאריך בסוף",
};

export const TASK_SORT_OPTIONS = TASK_SORT_VALUES.map(value => ({
  value,
  label: TASK_SORT_LABELS[value],
}));
