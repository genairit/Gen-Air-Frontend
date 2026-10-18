import { validateEmail } from "./email.validator";
import { type IValidationResult } from "../../interfaces/validation-result.interface";

export const validateRequiredEmail = (value: string): IValidationResult => {
  if (!value) {
    return { isValid: false, errorText: "שדה חובה" };
  }

  return validateEmail(value);
};
