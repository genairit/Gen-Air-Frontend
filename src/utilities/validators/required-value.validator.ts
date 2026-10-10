import { type IValidationResult } from "../../interfaces/validation-result.interface";

export const validateRequiredValue = (value: string): IValidationResult => {
  if (!value.trim()) {
    return { isValid: false, errorText: "שדה חובה" };
  }

  return { isValid: true, errorText: "" };
};
