import { parsePhoneNumberFromString } from "libphonenumber-js";
import { FIELD_INPUT_LIMITS } from "../constants/field-validation.constant";
import { FIELD_VALIDATION_REGEX } from "../constants/field-validation.constant";

export const toDialablePhone = (value: string): string | null => {
  const trimmed = value.trim();
  if (trimmed.length > FIELD_INPUT_LIMITS.PHONE_CHARACTERS) {
    return null;
  }
  const isIsraeliLocal = FIELD_VALIDATION_REGEX.ISRAELI_PHONE.test(
    trimmed.replace(/[\s().-]/g, ""),
  );
  const isInternational = /^\+[1-9][\d\s().-]+$/.test(trimmed);
  if (!isIsraeliLocal && !isInternational) {
    return null;
  }

  const phone = parsePhoneNumberFromString(trimmed, "IL");
  return phone?.isValid() ? phone.number : null;
};

export const toTelephoneHref = (value: string): string =>
  `tel:${toDialablePhone(value) ?? value.replace(/[^\d+]/g, "")}`;
