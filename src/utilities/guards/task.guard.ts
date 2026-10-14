import {
  isRecord,
  isNumber,
  isOptionalOf,
  hasStringFields,
  isNullableString,
} from "./primitive.guard";

import { isApiUser } from "./api.guard";
import type { IApiTask, ITaskCounts } from "../../interfaces/task.interface";
import { TASK_STATUS_VALUES, type TaskStatusType } from "../../constants/task.constant";

const TASK_TEXT_FIELDS = [
  "id",
  "title",
  "projectId",
  "customerId",
  "createdById",
  "createdAt",
  "updatedAt",
];

const TASK_NULLABLE_TEXT_FIELDS = [
  "assigneeId",
  "description",
  "dueDate",
  "deletedAt",
  "urgencyMarkedById",
  "urgencyMarkedAt",
];

export const isTaskStatus = (value: unknown): value is TaskStatusType =>
  TASK_STATUS_VALUES.some(status => status === value);

const isTaskReference = (value: unknown) =>
  isRecord(value) && hasStringFields(value, ["id", "name"]);

const hasValidRelations = (value: Record<string, unknown>) =>
  isOptionalOf(isApiUser)(value.assignee) &&
  isOptionalOf(isApiUser)(value.createdBy) &&
  isOptionalOf(isApiUser)(value.urgencyMarkedBy) &&
  (value.project == null || isTaskReference(value.project)) &&
  (value.customer == null || isTaskReference(value.customer));

export const isApiTask = (value: unknown): value is IApiTask => {
  if (!isRecord(value)) {
    return false;
  }

  const hasIdentity = hasStringFields(value, TASK_TEXT_FIELDS);
  const hasNullableFields = TASK_NULLABLE_TEXT_FIELDS.every(field =>
    isNullableString(value[field]),
  );
  const hasState = isTaskStatus(value.status) && typeof value.isUrgent === "boolean";

  return hasIdentity && hasNullableFields && hasState && hasValidRelations(value);
};

const isCount = (value: unknown) => isNumber(value) && Number.isInteger(value) && value >= 0;

export const isTaskCounts = (value: unknown): value is ITaskCounts => {
  if (!isRecord(value) || !isRecord(value.byStatus)) {
    return false;
  }

  const counts = value.byStatus;

  return (
    isCount(value.total) &&
    isCount(value.urgent) &&
    TASK_STATUS_VALUES.every(status => isCount(counts[status]))
  );
};
