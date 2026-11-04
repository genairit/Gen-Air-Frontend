import { PASSWORD_RULES } from "../../constants/password.constant";
import { type IValidationResult } from "../../interfaces/validation-result.interface";

export const validateCurrentPassword = (value: string): IValidationResult => ({
  isValid: value.length > 0,
  errorText: "",
});

export const validatePassword = (password: string): IValidationResult => {
  if (!password) {
    return { isValid: false, errorText: "" };
  }

  if (password.length < PASSWORD_RULES.MIN_LENGTH) {
    return {
      isValid: false,
      errorText: `הסיסמה חייבת להכיל לפחות ${PASSWORD_RULES.MIN_LENGTH} תווים`,
    };
  }

  return { isValid: true, errorText: "" };
};

export const createPasswordConfirmationValidator =
  (password: string) =>
  (confirmation: string): IValidationResult => {
    if (!confirmation) {
      return { isValid: false, errorText: "" };
    }

    if (confirmation !== password) {
      return { isValid: false, errorText: "הסיסמאות אינן תואמות" };
    }

    return { isValid: true, errorText: "" };
  };
