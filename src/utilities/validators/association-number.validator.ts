import { FIELD_VALIDATION_REGEX } from "../../constants/field-validation.constant";
import { type IValidationResult } from "../../interfaces/validation-result.interface";

export const validateAssociationNumber = (value: string): IValidationResult => {
  if (!value) {
    return { isValid: false, errorText: "שדה חובה" };
  }

  if (!FIELD_VALIDATION_REGEX.ASSOCIATION_NUMBER.test(value)) {
    return { isValid: false, errorText: "מ״ע מתחיל ב-58 ומורכב מ-9 ספרות" };
  }

  return { isValid: true, errorText: "" };
};
