import { FIELD_INPUT_LIMITS } from "../../constants/field-validation.constant";
import { type IValidationResult } from "../../interfaces/validation-result.interface";

export const validatePaymentTermsNote = (value: string): IValidationResult => {
  const trimmed = value.trim();

  if (!trimmed) {
    return { isValid: false, errorText: "פרט את התנאים המוסכמים" };
  }

  if (trimmed.length < FIELD_INPUT_LIMITS.PAYMENT_TERMS_NOTE_MIN_LENGTH) {
    return {
      isValid: false,
      errorText: `פרט עוד — לפחות ${FIELD_INPUT_LIMITS.PAYMENT_TERMS_NOTE_MIN_LENGTH} תווים`,
    };
  }

  return { isValid: true, errorText: "" };
};
