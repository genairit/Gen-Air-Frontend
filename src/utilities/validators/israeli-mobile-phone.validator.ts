import { FIELD_VALIDATION_REGEX } from "../../constants/field-validation.constant";
import { type IValidationResult } from "../../interfaces/validation-result.interface";

export const validateIsraeliMobilePhone = (value: string): IValidationResult => {
  const trimmed = value.trim();

  if (!trimmed) {
    return { isValid: false, errorText: "שדה חובה" };
  }

  if (!FIELD_VALIDATION_REGEX.ISRAELI_MOBILE_PHONE.test(trimmed)) {
    return { isValid: false, errorText: "מספר נייד ישראלי, לדוגמה 052-1234567" };
  }

  return { isValid: true, errorText: "" };
};
