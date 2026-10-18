import { isIdentityCard } from "class-validator";
import { IDENTITY_CARD_LOCALE } from "../../constants/locales.constants";
import { FIELD_VALIDATION_REGEX } from "../../constants/field-validation.constant";
import { type IValidationResult } from "../../interfaces/validation-result.interface";

// ח.פ and ת.פ use the same check-digit algorithm as an Israeli identity number.
export const validateCompanyNumber = (value: string): IValidationResult => {
  if (!value) {
    return { isValid: false, errorText: "שדה חובה" };
  }

  if (!FIELD_VALIDATION_REGEX.COMPANY_NUMBER.test(value)) {
    return { isValid: false, errorText: "ח.פ / ת.פ מורכב מ-9 ספרות" };
  }

  if (!isIdentityCard(value, IDENTITY_CARD_LOCALE)) {
    return { isValid: false, errorText: "ספרת הביקורת שגויה — בדוק את המספר" };
  }

  return { isValid: true, errorText: "" };
};
