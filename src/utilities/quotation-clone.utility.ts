import {
  CLONE_ERROR_CODES,
  CLONE_RECOVERY_BY_STATUS,
  CLONE_COMMAND_UUID_PATTERN,
} from "../constants/quotation-clone.constant";

import { isAxiosError } from "axios";
import { isRecord } from "./guards/primitive.guard";
import { getApiErrorMessage } from "./api-error.utility";
import { QUOTATION_BRANDS } from "../constants/quotation.constant";
import type { IRecommendedCloneCommand } from "../interfaces/quotation.interface";
import type { ICloneFailure, ICloneBrandOption } from "../interfaces/quotation-clone.interface";

export const cloneFailure = (error: unknown): ICloneFailure => {
  const status = isAxiosError(error) ? error.response?.status : null;
  const body: unknown = isAxiosError(error) ? error.response?.data : null;
  const code = isRecord(body) ? body.code : null;
  const staleSource = code === CLONE_ERROR_CODES.SOURCE_CHANGED;
  const unknownOutcome = !status || status >= 500;

  if (unknownOutcome) {
    return {
      staleSource,
      lines: ["נסה שוב לבדיקת התוצאה. אותה בקשת יצירה תיבדק שוב בבטחה."],
      title: "לא התקבל אישור ליצירה",
    };
  }

  if (staleSource) {
    return {
      staleSource,
      title: "הצעת המקור השתנתה",
      lines: ["רענן את הצעת המקור, ואז צור הצעה מחדש לפי הגרסה העדכנית."],
    };
  }

  const safeResponse = isRecord(body) ? body.safeResponse : null;
  const issues = isRecord(safeResponse) ? safeResponse.issues : null;
  const lines = Array.isArray(issues)
    ? issues
        .filter(isRecord)
        .flatMap((issue): string[] =>
          typeof issue.sku === "string" &&
          typeof issue.description === "string" &&
          typeof issue.reason === "string"
            ? [`\u2068${issue.sku}\u2069 · ${issue.description} · ${issue.reason}`]
            : [],
        )
    : [];
  const mappingFailed = code === CLONE_ERROR_CODES.MAPPING_FAILED;

  return {
    staleSource,
    title: mappingFailed ? "לא ניתן ליצור הצעה לחברה שנבחרה" : getApiErrorMessage(error),
    lines: mappingFailed
      ? [...lines, "בחר חברה אחרת, ערוך את הצעת המקור או פנה לאחראי הקטלוג."]
      : (CLONE_RECOVERY_BY_STATUS[status] ?? []),
  };
};

export const cloneBrandOptions = (
  sourceBrand: string | null,
  retainedTarget: string | null,
): ICloneBrandOption[] => [
  { value: "", label: "בחר חברה" },
  ...QUOTATION_BRANDS.filter(
    (brand): boolean => brand !== sourceBrand || brand === retainedTarget,
  ).map((brand): ICloneBrandOption => ({
    value: brand,
    label: brand,
  })),
];

export const isRecommendedCloneCommand = (value: unknown): value is IRecommendedCloneCommand => {
  if (!isRecord(value)) {
    return false;
  }

  const hasSource = typeof value.sourceId === "string" && value.sourceId.trim().length > 0;
  const hasTarget = typeof value.targetBrand === "string" && value.targetBrand.trim().length > 0;
  const version = value.sourceVersion;
  const key = value.idempotencyKey;
  const hasNumericVersion = typeof version === "number";
  const hasPositiveVersion = hasNumericVersion && version > 0;
  const hasIntegerVersion = hasNumericVersion && Number.isSafeInteger(version);
  const hasKey = typeof key === "string";
  const hasValidKey = hasKey && CLONE_COMMAND_UUID_PATTERN.test(key);
  return hasSource && hasTarget && hasPositiveVersion && hasIntegerVersion && hasValidKey;
};

export const safeCloneDiagnostics = (error: unknown): Record<string, unknown> => {
  const status = isAxiosError(error) ? (error.response?.status ?? null) : null;
  const body: unknown = isAxiosError(error) ? error.response?.data : null;
  const receivedCode = isRecord(body) ? body.code : null;
  const code =
    Object.values(CLONE_ERROR_CODES).find((candidate): boolean => candidate === receivedCode) ??
    null;
  const classification = isAxiosError(error) ? "http-or-transport" : "platform-or-client";
  const cause = error instanceof SyntaxError ? "invalid-json" : "request-or-storage-failure";
  return { classification, status, code, cause };
};
