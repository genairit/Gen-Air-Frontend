import { type IValidationResult } from "../../interfaces/validation-result.interface";

export const validateFreeText = (text: string): IValidationResult => ({
  isValid: text.length > 0,
  errorText: "",
});
