import type { ICreateCustomerPayload } from "../interfaces/customer.interface";
import { CUSTOMER_FORM_COPY, CUSTOMER_FORM_FIELDS } from "../constants/customer-form.constant";
import { PROJECT_DETAIL_FIELD_SET_VALUES } from "../constants/project-detail-field-set.constant";

export const normalizeCustomerForm = (values: ICreateCustomerPayload): ICreateCustomerPayload => ({
  name: values.name.trim(),
  taxId: values.taxId.trim(),
  address: values.address.trim(),
  contactName: values.contactName.trim(),
  phone: values.phone.trim(),
  email: values.email.trim(),
  customerType: values.customerType,
});

export const getCustomerFormErrors = (values: ICreateCustomerPayload) => {
  const payload = normalizeCustomerForm(values);
  const fieldErrors = CUSTOMER_FORM_FIELDS.flatMap(field => {
    const value = payload[field.field];
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
  return Object.fromEntries([...fieldErrors, ...typeErrors]);
};
