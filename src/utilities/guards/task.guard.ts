import {
  isRecord,
  isNumber,
  isOptionalOf,
  hasStringFields,
  isNullableString,
} from "./primitive.guard";

import type {
  IApiTask,
  ITaskCounts,
  IApiTaskProject,
  IApiTaskTransition,
} from "../../interfaces/task.interface";

import { isApiUser } from "./api.guard";
import { TASK_STATUS_VALUES, type TaskStatusType } from "../../constants/task.constant";
import type { IApiProjectReference, IApiCustomerReference } from "../../interfaces/api.interface";

const TASK_TEXT_FIELDS = ["id", "title", "createdById", "createdAt", "updatedAt"];

const TASK_NULLABLE_TEXT_FIELDS = [
  "projectId",
  "customerId",
  "assigneeId",
  "description",
  "dueDate",
  "deletedAt",
  "urgencyMarkedById",
  "urgencyMarkedAt",
];

export const isTaskStatus = (value: unknown): value is TaskStatusType =>
  TASK_STATUS_VALUES.some(status => status === value);

const isCustomerReference = (value: unknown): value is IApiCustomerReference =>
  isRecord(value) && hasStringFields(value, ["id", "name"]);

const isProjectReference = (value: unknown): value is IApiProjectReference => {
  if (!isRecord(value)) {
    return false;
  }

  const hasIdentity = hasStringFields(value, ["id", "code", "name"]);

  return hasIdentity && isOptionalOf(isCustomerReference)(value.customer);
};

const isTaskProjectReference = (value: unknown): value is IApiTaskProject => {
  if (!isRecord(value)) {
    return false;
  }

  const hasValidParent = isOptionalOf(isProjectReference)(value.parentProject);

  return isProjectReference(value) && hasValidParent;
};

const hasValidRelations = (value: Record<string, unknown>) =>
  isOptionalOf(isApiUser)(value.assignee) &&
  isOptionalOf(isApiUser)(value.createdBy) &&
  isOptionalOf(isApiUser)(value.urgencyMarkedBy) &&
  isOptionalOf(isTaskProjectReference)(value.project) &&
  isOptionalOf(isCustomerReference)(value.customer);

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

export const isApiTaskTransition = (value: unknown): value is IApiTaskTransition => {
  if (!isRecord(value)) {
    return false;
  }

  const hasIdentity = hasStringFields(value, ["id", "taskId", "createdAt", "changedById"]);
  const hasStatuses =
    isTaskStatus(value.toStatus) && (value.fromStatus === null || isTaskStatus(value.fromStatus));

  return hasIdentity && hasStatuses && isOptionalOf(isApiUser)(value.changedBy);
};
