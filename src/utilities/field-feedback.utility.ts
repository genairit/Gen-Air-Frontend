import { CUSTOMER_DETAILS_COPY } from "../constants/customer-details.constant";
import type { IValidationResult } from "../interfaces/validation-result.interface";

interface IFieldFeedbackOptions {
  isTouched: boolean;
  hint: string | null;
  isSubmitAttempted: boolean;
  validation: IValidationResult;
}

export const VALID_FIELD: IValidationResult = { isValid: true, errorText: "" };

export const getFieldFeedback = ({
  hint,
  isTouched,
  validation,
  isSubmitAttempted,
}: IFieldFeedbackOptions) => {
  const shouldReveal = isTouched || isSubmitAttempted;
  const isConfirmedValid = isTouched && validation.isValid;
  // Every field keeps a helper line so blurring a field never shifts the layout under a pending click.
  const idleHelperText = hint ?? CUSTOMER_DETAILS_COPY.RESERVED_HELPER_LINE;

  if (shouldReveal && !validation.isValid) {
    return { validation, infoText: "" };
  }

  return {
    validation: { isValid: validation.isValid, errorText: "" },
    infoText: isConfirmedValid ? CUSTOMER_DETAILS_COPY.VALID : idleHelperText,
  };
};
