import type {
  ITokenResult,
  ISuggestResponse,
  IFreeTextSegment,
  IFreeTextValidationResult,
  IFreeTextValidationSummary,
} from "../interfaces/free-text.interface";

import { isRecord } from "./guards/primitive.guard";
import type { TFreeTextValidationActionType } from "../constants/free-text.constants";
import { FREE_TEXT_STATUS, FREE_TEXT_VALIDATION_ACTION } from "../constants/free-text.constants";

const FREE_TEXT_STATUS_VALUES: readonly string[] = Object.values(FREE_TEXT_STATUS);
const FREE_TEXT_VALIDATION_ACTION_VALUES: readonly string[] = Object.values(
  FREE_TEXT_VALIDATION_ACTION,
);

export { isRecord } from "./guards/primitive.guard";

export const isFreeTextTokenStatus = (status: unknown): status is ITokenResult["status"] => {
  if (typeof status !== "string") {
    return false;
  }

  return FREE_TEXT_STATUS_VALUES.includes(status);
};

export const isFreeTextValidationAction = (
  action: unknown,
): action is TFreeTextValidationActionType => {
  if (typeof action !== "string") {
    return false;
  }

  return FREE_TEXT_VALIDATION_ACTION_VALUES.includes(action);
};

export const isFreeTextMatchedRule = (data: Record<string, unknown>): boolean => {
  if (!("matchedRule" in data)) {
    return true;
  }

  return typeof data.matchedRule === "string" || data.matchedRule === null;
};

export const isFreeTextTokenResult = (data: unknown): data is ITokenResult => {
  if (!isRecord(data)) {
    return false;
  }

  const hasValidReason = typeof data.reason === "string" || data.reason === null;

  return (
    typeof data.token === "string" &&
    typeof data.normalized === "string" &&
    hasValidReason &&
    isFreeTextMatchedRule(data) &&
    isFreeTextTokenStatus(data.status)
  );
};

export const isFreeTextSegment = (data: unknown): data is IFreeTextSegment => {
  if (!isRecord(data)) {
    return false;
  }

  const hasValidReason = typeof data.reason === "string" || data.reason === null;

  return (
    typeof data.text === "string" &&
    typeof data.start === "number" &&
    typeof data.end === "number" &&
    hasValidReason &&
    isFreeTextMatchedRule(data) &&
    isFreeTextTokenStatus(data.status)
  );
};

export const isFreeTextValidationSummary = (data: unknown): data is IFreeTextValidationSummary => {
  if (!isRecord(data)) {
    return false;
  }

  const hasValidStatus = data.status === null || isFreeTextTokenStatus(data.status);
  const hasValidFlaggedSegments =
    Array.isArray(data.flaggedSegments) &&
    data.flaggedSegments.every(item => typeof item === "string");

  return hasValidStatus && hasValidFlaggedSegments;
};

export const isFreeTextValidationResult = (data: unknown): data is IFreeTextValidationResult => {
  if (!isRecord(data)) {
    return false;
  }

  const hasValidTokens = Array.isArray(data.tokens) && data.tokens.every(isFreeTextTokenResult);
  const hasValidSegments = Array.isArray(data.segments) && data.segments.every(isFreeTextSegment);

  return (
    hasValidTokens &&
    hasValidSegments &&
    isFreeTextValidationAction(data.action) &&
    isFreeTextValidationSummary(data.summary)
  );
};

export const isFreeTextSuggestResponse = (data: unknown): data is ISuggestResponse => {
  if (!isRecord(data)) {
    return false;
  }

  return (
    Array.isArray(data.suggestions) && data.suggestions.every(item => typeof item === "string")
  );
};
