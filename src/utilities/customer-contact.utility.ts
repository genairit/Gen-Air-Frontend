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

export const getCustomerContactFieldErrors = (draft: ICustomerContactDraft) => {
  const input = toCustomerContactInput(draft);
  const invalidName =
    input.name.length < FIELD_INPUT_LIMITS.MIN_TEXT_LENGTH ||
    input.name.length > FIELD_INPUT_LIMITS.CUSTOMER_NAME_CHARACTERS;
  const invalidPhone = Boolean(
    input.phone && !FIELD_VALIDATION_REGEX.ISRAELI_PHONE.test(input.phone),
  );
  const invalidEmail = Boolean(input.email && !isEmail(input.email));
  const invalidRole = Boolean(
    input.role && input.role.length > FIELD_INPUT_LIMITS.CONTACT_ROLE_CHARACTERS,
  );

  return {
    name: invalidName ? CUSTOMER_CONTACT_COPY.NAME_ERROR : null,
    phone: invalidPhone ? CUSTOMER_CONTACT_COPY.PHONE_ERROR : null,
    email: invalidEmail ? CUSTOMER_CONTACT_COPY.EMAIL_ERROR : null,
    role: invalidRole ? CUSTOMER_CONTACT_COPY.ROLE_ERROR : null,
  };
};

export const validateCustomerContactDraft = (draft: ICustomerContactDraft): string[] =>
  Object.values(getCustomerContactFieldErrors(draft)).filter(error => error !== null);

export const formatCustomerContactCount = (contacts: ICustomerContact[]) =>
  contacts.length === 1 ? "איש קשר אחד" : `${contacts.length} אנשי קשר`;

export const formatCustomerPrimaryContact = (contacts: ICustomerContact[]) => {
  const primary = contacts[0];
  if (!primary) {
    return CUSTOMER_CONTACT_COPY.EMPTY;
  }

  const additionalCount = contacts.length - 1;
  return additionalCount > 0 ? `${primary.name} (+${additionalCount})` : primary.name;
};
