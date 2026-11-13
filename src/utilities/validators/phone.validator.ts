import { toDialablePhone } from "../phone.utility";
import { type IValidationResult } from "../../interfaces/validation-result.interface";

export const validatePhoneNumber = (phoneNumber: string): IValidationResult => {
  if (!phoneNumber) {
    return { isValid: false, errorText: "" };
  }

  if (phoneNumber.length > 20) {
    return { isValid: false, errorText: "מספר טלפון ארוך מדי" };
  }

  if (!toDialablePhone(phoneNumber)) {
    return { isValid: false, errorText: "מספר טלפון לא תקין" };
  }

  return {
    isValid: true,
    errorText: "",
  };
};
