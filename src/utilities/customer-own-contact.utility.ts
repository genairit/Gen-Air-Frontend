import type {
  ICustomerOwnContactDraft,
  ICustomerOwnContactInput,
  TCustomerOwnContactErrors,
} from "../interfaces/customer.interface";

import { CUSTOMER_FORM_COPY } from "../constants/customer-form.constant";
import type { ICustomerContact } from "../interfaces/customer-contact.interface";
import { CUSTOMER_OWN_CONTACT_FIELDS } from "../constants/customer-own-contact.constant";

export const toCustomerOwnContactDraft = (
  contact: ICustomerContact | null,
): ICustomerOwnContactDraft => ({
  phone: contact?.phone ?? "",
  email: contact?.email ?? "",
});

export const toCustomerOwnContactInput = (
  draft: ICustomerOwnContactDraft,
): ICustomerOwnContactInput => ({
  phone: draft.phone.trim() || null,
  email: draft.email.trim() || null,
});

export const getCustomerOwnContactErrors = (
  draft: ICustomerOwnContactDraft,
): TCustomerOwnContactErrors =>
  Object.fromEntries(
    CUSTOMER_OWN_CONTACT_FIELDS.flatMap(field => {
      const value = draft[field.field].trim();
      if (!value) {
        return [];
      }

      if (value.length > field.maxLength) {
        return [[field.field, CUSTOMER_FORM_COPY.TOO_LONG]];
      }

      const result = field.validator(value);
      return result.isValid ? [] : [[field.field, result.errorText]];
    }),
  );
