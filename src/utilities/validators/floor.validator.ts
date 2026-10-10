import { FIELD_VALIDATION_REGEX } from "../../constants/field-validation.constant";
import { type IValidationResult } from "../../interfaces/validation-result.interface";

export const validateFloor = (value: string): IValidationResult => {
  if (!value) {
    return { isValid: false, errorText: "שדה חובה" };
  }

  if (!FIELD_VALIDATION_REGEX.FLOOR.test(value)) {
    return { isValid: false, errorText: "קומה מספרית, לדוגמה 7 (או -1 לחניון)" };
  }

  return { isValid: true, errorText: "" };
};
