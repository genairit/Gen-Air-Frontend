import { APARTMENT_VALIDATION } from "../../constants/apartment-validation.constant";
import type { IValidationResult } from "../../interfaces/validation-result.interface";

export const validateApartmentNumber = (value: string): IValidationResult => {
  const apartmentNumber = value.trim();
  const hasValidPattern = APARTMENT_VALIDATION.NUMBER_PATTERN.test(apartmentNumber);
  const hasValidLength = apartmentNumber.length <= APARTMENT_VALIDATION.MAX_NUMBER_LENGTH;

  if (!apartmentNumber) {
    return { isValid: false, errorText: "שדה חובה" };
  }
  return {
    isValid: hasValidPattern && hasValidLength,
    errorText: `מספר דירה בפורמט 24 או 24א (עד ${APARTMENT_VALIDATION.MAX_NUMBER_LENGTH} תווים)`,
  };
};
