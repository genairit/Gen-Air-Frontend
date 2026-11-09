import type {
  TCustomerFormErrors,
  ICreateCustomerPayload,
  ICustomerCreateRequest,
} from "../interfaces/customer.interface";

import { CUSTOMER_FORM_COPY, CUSTOMER_FORM_FIELDS } from "../constants/customer-form.constant";
import { PROJECT_DETAIL_FIELD_SET_VALUES } from "../constants/project-detail-field-set.constant";

export const normalizeCustomerForm = (values: ICreateCustomerPayload): ICustomerCreateRequest => ({
  paymentTerms: values.paymentTerms ?? null,
  name: values.name.trim(),
  taxId: values.taxId.trim(),
  address: values.address.trim(),
  contactName: values.contactName.trim() || null,
  phone: values.phone.trim() || null,
  email: values.email.trim() || null,
  customerType: values.customerType,
});

export const getCustomerFormErrors = (values: ICreateCustomerPayload): TCustomerFormErrors => {
  const payload = normalizeCustomerForm(values);
  const fieldErrors = CUSTOMER_FORM_FIELDS.flatMap(field => {
    const value = values[field.field].trim();
    const isOptionalContactDetail = field.field === "phone" || field.field === "email";
    const isEmptyOptionalContact =
      !value &&
      (isOptionalContactDetail ||
        (field.field === "contactName" && !payload.phone && !payload.email));
    if (isEmptyOptionalContact) {
      return [];
    }

    const result = field.validator(value);
    if (!result.isValid) {
      return [[field.field, result.errorText]];
    }

    if (value.length > field.maxLength) {
      return [[field.field, CUSTOMER_FORM_COPY.TOO_LONG]];
    }

    return [];
  });
  const typeErrors = PROJECT_DETAIL_FIELD_SET_VALUES.includes(payload.customerType)
    ? []
    : [["customerType", CUSTOMER_FORM_COPY.REQUIRED_TYPE]];
  const contactNameErrors =
    !payload.contactName && (payload.phone || payload.email)
      ? [["contactName", CUSTOMER_FORM_COPY.CONTACT_NAME_REQUIRED]]
      : [];
  return Object.fromEntries([...fieldErrors, ...typeErrors, ...contactNameErrors]);
};

export const countCustomerFormErrors = (values: ICreateCustomerPayload) =>
  Object.keys(getCustomerFormErrors(values)).length;
