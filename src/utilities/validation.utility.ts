import {
  validateId,
  validateName,
  validateEmail,
  validateNumber,
  validatePassword,
  validateFreeText,
  validateHebrewText,
  validatePhoneNumber,
} from "./validators";

import type { IValidationResult } from "../interfaces/validation-result.interface";
import { type TFieldType } from "../components/TextField/constants/textfield.constants";

const builtInValidators: Record<TFieldType, (val: string) => IValidationResult> = {
  tz: val => validateId(val),
  name: val => validateName(val),
  number: val => validateNumber(val),
  text: val => validateHebrewText(val),
  phone: val => validatePhoneNumber(val),
  email: val => validateEmail(val),
  date: val => validateFreeText(val),
  search: val => validateFreeText(val),
  password: val => validatePassword(val),
};

export const validateInput = (
  value: string,
  type: TFieldType,
  customValidator?: (val: string) => IValidationResult,
): IValidationResult => {
  const stringValue = value?.toString() ?? "";

  if (customValidator) {
    return customValidator(stringValue);
  }

  const validate = builtInValidators[type] || builtInValidators.text;

  return validate(stringValue);
};
