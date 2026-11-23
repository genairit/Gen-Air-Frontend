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
  phone: values.phone.trim() || null,
  email: values.email.trim() || null,
  customerType: values.customerType,
});

export const getCustomerFormErrors = (values: ICreateCustomerPayload): TCustomerFormErrors => {
  const fieldErrors = CUSTOMER_FORM_FIELDS.flatMap(field => {
    const value = values[field.field].trim();
    const isOptionalContactDetail = field.field === "phone" || field.field === "email";
    const isEmptyOptionalContact = !value && isOptionalContactDetail;
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
  const typeErrors = PROJECT_DETAIL_FIELD_SET_VALUES.includes(values.customerType)
    ? []
    : [["customerType", CUSTOMER_FORM_COPY.REQUIRED_TYPE]];
  return Object.fromEntries([...fieldErrors, ...typeErrors]);
};

export const countCustomerFormErrors = (values: ICreateCustomerPayload) =>
  Object.keys(getCustomerFormErrors(values)).length;
