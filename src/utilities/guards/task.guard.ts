import type { IApiTask, ITaskCounts } from "../../interfaces/task.interface";
import { TASK_STATUS_VALUES, type TaskStatusType } from "../../constants/task.constant";
import { isRecord, isNumber, isNullableString, hasStringFields } from "./primitive.guard";

export const isTaskStatus = (value: unknown): value is TaskStatusType =>
  TASK_STATUS_VALUES.some(status => status === value);

export const isApiTask = (value: unknown): value is IApiTask => {
  if (!isRecord(value)) {
    return false;
  }
  const hasIdentity = hasStringFields(value, [
    "id",
    "title",
    "projectId",
    "customerId",
    "createdById",
    "createdAt",
    "updatedAt",
  ]);
  const hasNullableFields = [
    "assigneeId",
    "description",
    "dueDate",
    "deletedAt",
    "urgencyMarkedById",
    "urgencyMarkedAt",
  ].every(field => isNullableString(value[field]));
  return (
    hasIdentity &&
    hasNullableFields &&
    isTaskStatus(value.status) &&
    typeof value.isUrgent === "boolean"
  );
};

export const isTaskCounts = (value: unknown): value is ITaskCounts => {
  if (!isRecord(value) || !isRecord(value.byStatus)) {
    return false;
  }
  const counts = value.byStatus;
  const isCount = (count: unknown) => isNumber(count) && Number.isInteger(count) && count >= 0;
  return (
    isCount(value.total) &&
    isCount(value.urgent) &&
    TASK_STATUS_VALUES.every(status => isCount(counts[status]))
  );
};
