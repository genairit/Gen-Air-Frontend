import {
  CUSTOMER_IMPORT_ERROR_COPY,
  CUSTOMER_IMPORT_ERROR_MESSAGES,
  CUSTOMER_IMPORT_STATUS_MESSAGES,
} from "../constants/customer-import-error.constant";

import { isAxiosError } from "axios";
import { isRecord } from "./guards/primitive.guard";

export const getCustomerImportErrorCode = (error: unknown): string | null => {
  const response: unknown = isAxiosError(error) ? error.response?.data : null;
  if (!isRecord(response) || typeof response.code !== "string") {
    return null;
  }

  return response.code;
};

export const getCustomerImportErrorMessage = (error: unknown): string => {
  const code = getCustomerImportErrorCode(error);
  const knownCode = code !== null && Object.hasOwn(CUSTOMER_IMPORT_ERROR_MESSAGES, code);
  if (knownCode) {
    return CUSTOMER_IMPORT_ERROR_MESSAGES[code];
  }

  const status = isAxiosError(error) ? (error.response?.status ?? 0) : 0;
  return CUSTOMER_IMPORT_STATUS_MESSAGES[status] ?? CUSTOMER_IMPORT_ERROR_COPY.GENERIC;
};
