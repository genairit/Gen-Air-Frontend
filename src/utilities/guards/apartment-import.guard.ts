import type {
  IImportSkippedRow,
  IApartmentImportResponse,
} from "../../interfaces/apartment-import.interface";

import { isRecord } from "./primitive.guard";
import { IMPORT_ROW_STATUS } from "../../constants/apartment-import.constant";

const isCount = (value: unknown): value is number =>
  typeof value === "number" && Number.isSafeInteger(value) && value >= 0;

const isSkippedRow = (value: unknown): value is IImportSkippedRow => {
  if (!isRecord(value)) {
    return false;
  }

  const validRowNumber = isCount(value.rowNumber) && value.rowNumber > 1;
  const validFields = typeof value.apartment === "string" && typeof value.reason === "string";
  const validStatus =
    value.status === IMPORT_ROW_STATUS.EXISTING ||
    value.status === IMPORT_ROW_STATUS.DUPLICATE ||
    value.status === IMPORT_ROW_STATUS.ERROR;
  return validRowNumber && validFields && validStatus;
};

export const isApartmentImportResponse = (value: unknown): value is IApartmentImportResponse => {
  if (!isRecord(value) || !isRecord(value.counts)) {
    return false;
  }

  const counts = value.counts;
  const validCounts = Object.values(IMPORT_ROW_STATUS).every(status => isCount(counts[status]));
  const validRows = Array.isArray(value.rows) && value.rows.every(isSkippedRow);
  const validReport = value.reportBase64 === null || typeof value.reportBase64 === "string";
  return validCounts && validRows && validReport;
};
