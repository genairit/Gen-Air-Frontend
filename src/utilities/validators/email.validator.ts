import { REGEX_VALIDATION } from "../../constants/regex.constants";
import { type IValidationResult } from "../../interfaces/validation-result.interface";

export const validateEmail = (email: string): IValidationResult => {
  if (!email) {
    return { isValid: false, errorText: "" };
  }

  if (!REGEX_VALIDATION.EMAIL.test(email)) {
    return { isValid: false, errorText: "כתובת הדוא״ל אינה תקינה" };
  }

  return { isValid: true, errorText: "" };
};
