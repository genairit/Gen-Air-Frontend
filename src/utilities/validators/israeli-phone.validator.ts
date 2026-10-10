import { FIELD_VALIDATION_REGEX } from "../../constants/field-validation.constant";
import { type IValidationResult } from "../../interfaces/validation-result.interface";

export const validateIsraeliPhone = (value: string): IValidationResult => {
  if (!value) {
    return { isValid: false, errorText: "שדה חובה" };
  }

  if (!FIELD_VALIDATION_REGEX.ISRAELI_PHONE.test(value)) {
    return {
      isValid: false,
      errorText: "מספר ישראלי תקין, לדוגמה 052-1234567 או 03-1234567",
    };
  }

  return { isValid: true, errorText: "" };
};
