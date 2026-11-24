import { QUOTATION_LIFECYCLE_COPY } from "../constants/quotation.constant";
import type { IValidationResult } from "../interfaces/validation-result.interface";
import { MAX_QUOTATION_CANCELLATION_REASON_LENGTH } from "../constants/quotation.constant";

export const validateQuotationReason = (value: string): IValidationResult => {
  const reason = value.trim();
  if (reason.length === 0) {
    return { isValid: false, errorText: QUOTATION_LIFECYCLE_COPY.REASON_REQUIRED };
  }
  if (reason.length > MAX_QUOTATION_CANCELLATION_REASON_LENGTH) {
    return { isValid: false, errorText: QUOTATION_LIFECYCLE_COPY.REASON_TOO_LONG };
  }
  return { isValid: true, errorText: "" };
};
