import {
  toAssigneeId,
  toDateInputValue,
  toAssigneeOptionId,
  getTaskDueDateError,
} from "./task.utility";

import type {
  IApiTask,
  ITaskFormValues,
  TTaskFormErrors,
  TUpdateTaskPayload,
} from "../interfaces/task.interface";

import { NEW_TASK_COPY } from "../constants/task.constant";

export const toTaskEditValues = (task: IApiTask): ITaskFormValues => ({
  title: task.title,
  taskType: task.taskType,
  projectId: task.projectId,
  isUrgent: task.isUrgent,
  description: task.description ?? "",
  dueDate: toDateInputValue(task.dueDate),
  assigneeOptionId: toAssigneeOptionId(task.assigneeId),
});

interface ITaskEditOptions {
  canEdit: boolean;
  canAssign: boolean;
  values: ITaskFormValues;
  initialValues: ITaskFormValues;
}

export const getTaskEdit = ({ values, initialValues, canEdit, canAssign }: ITaskEditOptions) => {
  const title = values.title.trim();
  const description = values.description.trim();
  const changes: TUpdateTaskPayload = {};
  const errors: TTaskFormErrors = {};

  if (canEdit && title !== initialValues.title.trim()) {
    changes.title = title;
    if (!title) {
      errors.title = NEW_TASK_COPY.REQUIRED;
    }
  }
  if (canEdit && description !== initialValues.description.trim()) {
    changes.description = description;
    if (!description) {
      errors.description = NEW_TASK_COPY.REQUIRED;
    }
  }
  if (canEdit && values.dueDate !== initialValues.dueDate) {
    changes.dueDate = values.dueDate || null;
    const error = getTaskDueDateError(values.dueDate);
    if (error) {
      errors.dueDate = error;
    }
  }
  if (canAssign && values.assigneeOptionId !== initialValues.assigneeOptionId) {
    changes.assigneeId = toAssigneeId(values.assigneeOptionId);
    if (!values.assigneeOptionId) {
      errors.assigneeOptionId = NEW_TASK_COPY.REQUIRED;
    }
  }
  return { changes, errors };
};
