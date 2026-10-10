import { REGEX_VALIDATION } from "../../constants/regex.constants";
import { type IValidationResult } from "../../interfaces/validation-result.interface";

export const validateName = (name: string): IValidationResult => {
  if (!name) {
    return { isValid: false, errorText: "" };
  }

  const isValidHebrewName = REGEX_VALIDATION.FLEXIBLE_HEBREW_NAME.test(name);

  if (!isValidHebrewName) {
    return { isValid: false, errorText: "יש להכניס שם תקין בעברית" };
  }

  if (name.length > 20) {
    return { isValid: false, errorText: "שם ארוך מדי" };
  }

  if (name.length < 2) {
    return { isValid: false, errorText: "שם קצר מדי" };
  }

  return {
    isValid: true,
    errorText: "",
  };
};