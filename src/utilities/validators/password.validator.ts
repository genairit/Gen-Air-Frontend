import { type IValidationResult } from "../../interfaces/validation-result.interface";

const MIN_PASSWORD_LENGTH = 8;

export const validatePassword = (password: string): IValidationResult => {
  if (!password) {
    return { isValid: false, errorText: "" };
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    return { isValid: false, errorText: `הסיסמה חייבת להכיל לפחות ${MIN_PASSWORD_LENGTH} תווים` };
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
