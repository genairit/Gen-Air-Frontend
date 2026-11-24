import {
  PUBLICATION_KIND,
  PUBLICATION_STATE,
  type PublicationKindType,
  type PublicationStateType,
  PUBLICATION_DRIVE_URL_PATTERNS,
} from "../../constants/quotation-publication.constant";

import type {
  IQuotationPublication,
  IQuotationPublicationStage,
} from "../../interfaces/quotation-publication.interface";

import { isRecord, isNullableString, isNullableNumber, isNumber } from "./primitive.guard";

export const isPublicationState = (value: unknown): value is PublicationStateType =>
  Object.values(PUBLICATION_STATE).some((state): boolean => state === value);
export const isPublicationKind = (value: unknown): value is PublicationKindType =>
  Object.values(PUBLICATION_KIND).some((kind): boolean => kind === value);
export const isPublicationUrl = (value: unknown): value is string | null => {
  if (value === null) {
    return true;
  }

  if (typeof value !== "string") {
    return false;
  }

  const hasBoundaryWhitespace = value !== value.trim();
  if (hasBoundaryWhitespace) {
    return false;
  }

  const isDriveFilePath = PUBLICATION_DRIVE_URL_PATTERNS.FILE.test(value);
  const isDriveOpenPath = PUBLICATION_DRIVE_URL_PATTERNS.OPEN.test(value);
  return isDriveFilePath || isDriveOpenPath;
};
const hasPublicationFields = (value: Record<string, unknown>): boolean => {
  const hasState = isPublicationState(value.state);
  const hasDescription = isNullableString(value.reason) && isNullableString(value.destinationLabel);
  const hasTimestamp = isNullableString(value.updatedAt);
  const hasFile = isPublicationUrl(value.fileUrl);
  return hasState && hasDescription && hasTimestamp && hasFile;
};
const isPublicationStage = (value: unknown): value is IQuotationPublicationStage => {
  if (!isRecord(value)) {
    return false;
  }

  const hasIdentity = typeof value.cycleId === "string" && isNumber(value.generation);
  const hasSource = isNumber(value.sourceVersion) && isPublicationKind(value.documentKind);
  const hasCorrelation = isNullableString(value.lifecycleEventId);
  return hasPublicationFields(value) && hasIdentity && hasSource && hasCorrelation;
};
export const isQuotationPublication = (value: unknown): value is IQuotationPublication => {
  if (!isRecord(value)) {
    return false;
  }

  const hasRetry = typeof value.canRetry === "boolean";
  const hasIdentity = isNullableString(value.cycleId) && isNullableNumber(value.generation);
  const hasSourceKind = value.documentKind === null || isPublicationKind(value.documentKind);
  const hasSource = isNullableNumber(value.sourceVersion) && hasSourceKind;
  const hasHistory = Array.isArray(value.history) && value.history.every(isPublicationStage);
  return hasPublicationFields(value) && hasRetry && hasIdentity && hasSource && hasHistory;
};
