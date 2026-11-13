import { toDialablePhone } from "../phone.utility";
import { type IValidationResult } from "../../interfaces/validation-result.interface";

export const validateIsraeliMobilePhone = (value: string): IValidationResult => {
  const trimmed = value.trim();

  if (!trimmed) {
    return { isValid: false, errorText: "שדה חובה" };
  }

  if (!toDialablePhone(trimmed)) {
    return { isValid: false, errorText: "מספר ישראלי תקין או מספר בינלאומי עם + וקידומת מדינה" };
  }

  return { isValid: true, errorText: "" };
};
