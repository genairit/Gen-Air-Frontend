import { validateIsraeliPhone } from "./israeli-phone.validator";
import { type IValidationResult } from "../../interfaces/validation-result.interface";

export const validateOptionalIsraeliPhone = (value: string): IValidationResult => {
  if (!value.trim()) {
    return { isValid: true, errorText: "" };
  }

  return validateIsraeliPhone(value.trim());
};
