import { isAxiosError } from "axios";
import { isRecord } from "./guards/primitive.guard";
import { getApiErrorMessage } from "./api-error.utility";
import { QUOTATION_BRANDS } from "../constants/quotation.constant";
import { CLONE_RECOVERY_BY_STATUS } from "../constants/quotation-clone.constant";
import type { ICloneFailure, ICloneBrandOption } from "../interfaces/quotation-clone.interface";

export const cloneFailure = (error: unknown): ICloneFailure => {
  const status = isAxiosError(error) ? error.response?.status : null;
  const body: unknown = isAxiosError(error) ? error.response?.data : null;
  const code = isRecord(body) ? body.code : null;
  const staleSource = code === "QUOTATION_CLONE_SOURCE_CHANGED";
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
  const mappingFailed = code === "QUOTATION_CLONE_MAPPING_FAILED";

  return {
    staleSource,
    title: mappingFailed ? "לא ניתן ליצור הצעה לחברה שנבחרה" : getApiErrorMessage(error),
    lines: mappingFailed
      ? [...lines, "בחר חברה אחרת, ערוך את הצעת המקור או פנה לאחראי הקטלוג."]
      : (CLONE_RECOVERY_BY_STATUS[status] ?? []),
  };
};

export const cloneBrandOptions = (sourceBrand: string | null): ICloneBrandOption[] => [
  { value: "", label: "בחר חברה" },
  ...QUOTATION_BRANDS.filter((brand): boolean => brand !== sourceBrand).map(
    (brand): ICloneBrandOption => ({
      value: brand,
      label: brand,
    }),
  ),
];
