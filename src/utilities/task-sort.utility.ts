import { TASK_SORTS, TASK_SORT_VALUES, type TaskSortType } from "../constants/task-sort.constant";

export const isTaskSort = (value: unknown): value is TaskSortType =>
  TASK_SORT_VALUES.some(sort => sort === value);

export const toTaskSort = (value: string): TaskSortType =>
  isTaskSort(value) ? value : TASK_SORTS.DEFAULT;
