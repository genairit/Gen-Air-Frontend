import type {
  ITaskQuotationResult,
  ITaskQuotationContext,
  ITaskQuotationSummary,
} from "../../interfaces/task-quotation.interface";

import { isQuotationStatus } from "./quotation.guard";
import { TASK_QUOTATION_UNAVAILABLE } from "../../constants/task-quotation.constant";
import { isRecord, isArrayOf, hasStringFields, isNullableString } from "./primitive.guard";

export const isTaskQuotationSummary = (value: unknown): value is ITaskQuotationSummary =>
  isRecord(value) &&
  hasStringFields(value, ["id", "number"]) &&
  isQuotationStatus(value.status) &&
  typeof value.isPrimary === "boolean";

export const isTaskQuotationContext = (value: unknown): value is ITaskQuotationContext =>
  isRecord(value) &&
  typeof value.canCreate === "boolean" &&
  isNullableString(value.projectId) &&
  isNullableString(value.customerId) &&
  isNullableString(value.primaryQuotationId) &&
  isArrayOf(isTaskQuotationSummary)(value.quotations) &&
  (value.unavailableReason === null ||
    Object.values(TASK_QUOTATION_UNAVAILABLE).some(reason => reason === value.unavailableReason));

export const isTaskQuotationResult = (value: unknown): value is ITaskQuotationResult =>
  isRecord(value) && typeof value.created === "boolean" && typeof value.quotationId === "string";
