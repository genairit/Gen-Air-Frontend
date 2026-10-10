import { isIdentityCard } from "class-validator";
import { IDENTITY_CARD_LOCALE } from "../../constants/locales.constants"
import { type IValidationResult } from "../../interfaces/validation-result.interface";

export const validateId = (id: string): IValidationResult => {
  if (!id) {
    return { isValid: false, errorText: "" };
  }

  if (id.length > 9) {
    return { isValid: false, errorText: "תעודת זהות ארוכה מדי" };
  }

  if (id.length < 9) {
    return { isValid: false, errorText: "תעודת זהות קצרה מדי" };
  }

  if (!isIdentityCard(id, IDENTITY_CARD_LOCALE)) {
    return { isValid: false, errorText: "תעודת זהות לא תקינה" };
  }

  return {
    isValid: true,
    errorText: "",
  };
};