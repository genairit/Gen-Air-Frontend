import { isPhoneNumber } from "class-validator";
import { REGEX_VALIDATION } from "../../constants/regex.constants";
import { PHONE_NUMBER_LOCALE } from "../../constants/locales.constants";
import { type IValidationResult } from "../../interfaces/validation-result.interface";

export const validatePhoneNumber = (phoneNumber: string): IValidationResult => {
  if (!phoneNumber) {
    return { isValid: false, errorText: "" };
  }

  if (phoneNumber.length > 10) {
    return { isValid: false, errorText: "מספר טלפון ארוך מדי" };
  }

  if (phoneNumber.length < 10) {
    return { isValid: false, errorText: "מספר טלפון קצר מדי" };
  }

  if (!isPhoneNumber(phoneNumber, PHONE_NUMBER_LOCALE)) {
    return { isValid: false, errorText: "מספר טלפון לא תקין" };
  }

  if (!REGEX_VALIDATION.ISRAELI_PHONE_NUMBER.test(phoneNumber)) {
    return { isValid: false, errorText: "מספר טלפון לא תקין" };
  }

  return {
    isValid: true,
    errorText: "",
  };
};