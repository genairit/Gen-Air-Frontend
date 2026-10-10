import { REGEX_VALIDATION } from "../../constants/regex.constants";
import { type IValidationResult } from "../../interfaces/validation-result.interface";

export const validateHebrewText = (name: string): IValidationResult => {
  if (!name) {
    return { isValid: false, errorText: "" };
  }

  const isValidHebrewName = REGEX_VALIDATION.FLEXIBLE_HEBREW_NAME.test(name);

  if (!isValidHebrewName) {
    return { isValid: false, errorText: "יש להכניס תווים בעברית בלבד" };
  }

  if (name.length > 30) {
    return { isValid: false, errorText: "טקסט ארוך מידי" };
  }

  if (name.length < 2) {
    return { isValid: false, errorText: "טקסט קצר מדי" };
  }

  return {
    isValid: true,
    errorText: "",
  };
};