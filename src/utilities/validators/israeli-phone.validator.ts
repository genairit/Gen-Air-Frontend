import { toDialablePhone } from "../phone.utility";
import { type IValidationResult } from "../../interfaces/validation-result.interface";

export const validateIsraeliPhone = (value: string): IValidationResult => {
  if (!value) {
    return { isValid: false, errorText: "שדה חובה" };
  }

  if (!toDialablePhone(value)) {
    return {
      isValid: false,
      errorText: "מספר ישראלי תקין או מספר בינלאומי עם + וקידומת מדינה",
    };
  }

  return { isValid: true, errorText: "" };
};
