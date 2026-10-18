import { FIELD_INPUT_LIMITS } from "../../constants/field-validation.constant";
import { type IValidationResult } from "../../interfaces/validation-result.interface";

export const validateContactName = (value: string): IValidationResult => {
  const trimmed = value.trim();

  if (!trimmed) {
    return { isValid: false, errorText: "שדה חובה" };
  }

  if (trimmed.length < FIELD_INPUT_LIMITS.MIN_TEXT_LENGTH) {
    return { isValid: false, errorText: "שם קצר מדי" };
  }

  return { isValid: true, errorText: "" };
};
