import {
  isRecord,
  isArrayOf,
  hasStringFields,
  isNullableString,
} from "./primitive.guard";

import { EXECUTION_PLAN_STATUS } from "../../constants/execution-plan.constant";
import type {
  IExecutionPlanTemplate,
  IExecutionPlanSubmission,
  IExecutionPlanPendingPage,
  IExecutionPlanChecklistItem,
} from "../../interfaces/execution-plan.interface";

const isChecklistItem = (value: unknown): value is IExecutionPlanChecklistItem =>
  isRecord(value) &&
  hasStringFields(value, ["key", "label"]) &&
  typeof value.confirmed === "boolean";

export const isExecutionPlanTemplate = (value: unknown): value is IExecutionPlanTemplate =>
  isRecord(value) &&
  hasStringFields(value, ["id", "createdAt"]) &&
  typeof value.version === "number" &&
  Array.isArray(value.items) &&
  value.items.every(item => isRecord(item) && hasStringFields(item, ["key", "label"]));

export const isExecutionPlanSubmission = (value: unknown): value is IExecutionPlanSubmission =>
  isRecord(value) &&
  hasStringFields(value, [
    "id",
    "quotationId",
    "projectId",
    "driveFileId",
    "driveFileVersion",
    "driveFileName",
    "planVersion",
    "submittedById",
    "createdAt",
    "updatedAt",
  ]) &&
  Object.values(EXECUTION_PLAN_STATUS).some(status => status === value.status) &&
  typeof value.revision === "number" &&
  typeof value.templateVersion === "number" &&
  isArrayOf(isChecklistItem)(value.checklist) &&
  isNullableString(value.submittedAt) &&
  isNullableString(value.reviewedById) &&
  isNullableString(value.reviewedAt) &&
  isNullableString(value.returnComment) &&
  isNullableString(value.supersedesId);

export const isExecutionPlanPendingPage = (value: unknown): value is IExecutionPlanPendingPage =>
  isRecord(value) &&
  typeof value.count === "number" &&
  isArrayOf(isExecutionPlanSubmission)(value.rows);
