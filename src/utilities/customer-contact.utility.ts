import type {
  ICustomerContact,
  ICustomerContactDraft,
  ICustomerContactInput,
} from "../interfaces/customer-contact.interface";

import { isEmail } from "class-validator";
import { isRecord, isNullableString } from "./guards/primitive.guard";
import { CUSTOMER_CONTACT_COPY } from "../constants/customer-contact.constant";
import { FIELD_INPUT_LIMITS, FIELD_VALIDATION_REGEX } from "../constants/field-validation.constant";

export const isCustomerContact = (value: unknown): value is ICustomerContact => {
  if (!isRecord(value)) {
    return false;
  }

  const hasIdentity =
    typeof value.id === "string" &&
    typeof value.customerId === "string" &&
    typeof value.name === "string";
  const hasDetails =
    isNullableString(value.phone) && isNullableString(value.email) && isNullableString(value.role);
  return hasIdentity && hasDetails;
};

export const isCustomerContactList = (value: unknown): value is ICustomerContact[] =>
  Array.isArray(value) && value.every(isCustomerContact);

export const toCustomerContactDraft = (
  contact: ICustomerContact | null,
): ICustomerContactDraft => ({
  name: contact?.name ?? "",
  role: contact?.role ?? "",
  email: contact?.email ?? "",
  phone: contact?.phone ?? "",
});

export const toCustomerContactInput = (draft: ICustomerContactDraft): ICustomerContactInput => ({
  name: draft.name.trim(),
  role: draft.role.trim() || null,
  email: draft.email.trim() || null,
  phone: draft.phone.trim() || null,
});

export const validateCustomerContactDraft = (draft: ICustomerContactDraft): string[] => {
  const input = toCustomerContactInput(draft);
  const errors: string[] = [];
  const invalidName =
    input.name.length < FIELD_INPUT_LIMITS.MIN_TEXT_LENGTH ||
    input.name.length > FIELD_INPUT_LIMITS.CUSTOMER_NAME_CHARACTERS;
  if (invalidName) {
    errors.push(CUSTOMER_CONTACT_COPY.NAME_ERROR);
  }

  if (input.phone && !FIELD_VALIDATION_REGEX.ISRAELI_PHONE.test(input.phone)) {
    errors.push(CUSTOMER_CONTACT_COPY.PHONE_ERROR);
  }

  if (input.email && !isEmail(input.email)) {
    errors.push(CUSTOMER_CONTACT_COPY.EMAIL_ERROR);
  }

  if (input.role && input.role.length > FIELD_INPUT_LIMITS.CONTACT_ROLE_CHARACTERS) {
    errors.push(CUSTOMER_CONTACT_COPY.ROLE_ERROR);
  }

  return errors;
};
