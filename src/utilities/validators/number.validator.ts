import { REGEX_VALIDATION } from "../../constants/regex.constants";
import { type IValidationResult } from "../../interfaces/validation-result.interface";

export const validateNumber = (value: string): IValidationResult => {
  if (!value) {
    return { isValid: false, errorText: "" };
  }

  const isValid = REGEX_VALIDATION.DIGITS_ONLY.test(value);

  return {
    isValid,
    errorText: isValid ? "" : "מספרים בלבד",
  };
};