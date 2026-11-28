import {
  customerPaymentConfiguration,
  getCustomerPaymentConfigurationError,
} from "./payment-configuration.utility";

import type {
  TCustomerFormErrors,
  TCustomerUpdateRequest,
  ICreateCustomerPayload,
  ICustomerCreateRequest,
} from "../interfaces/customer.interface";

import type { IApiCustomer } from "../interfaces/api.interface";
import { CUSTOMER_FORM_COPY, CUSTOMER_FORM_FIELDS } from "../constants/customer-form.constant";
import { PROJECT_DETAIL_FIELD_SET_VALUES } from "../constants/project-detail-field-set.constant";

export const normalizeCustomerForm = (values: ICreateCustomerPayload): ICustomerCreateRequest => ({
  ...customerPaymentConfiguration(values),
  name: values.name.trim(),
  taxId: values.taxId.trim(),
  address: values.address.trim(),
  phone: values.phone.trim() || null,
  email: values.email.trim() || null,
  customerType: values.customerType,
});

export const customerFormValues = (customer: IApiCustomer): ICreateCustomerPayload => ({
  name: customer.name,
  taxId: customer.taxId,
  address: customer.address,
  customerType: customer.customerType,
  phone: (customer.primaryContact ? customer.primaryContact.phone : customer.phone) ?? "",
  email: (customer.primaryContact ? customer.primaryContact.email : customer.email) ?? "",
  ...customerPaymentConfiguration(customer),
});

export const customerFormChanges = (
  original: IApiCustomer,
  draft: ICreateCustomerPayload,
): TCustomerUpdateRequest => {
  const before = normalizeCustomerForm(customerFormValues(original));
  const after = normalizeCustomerForm(draft);
  const { paymentTerms, paymentSchedule } = after;
  const changedFields = CUSTOMER_FORM_FIELDS.filter(
    ({ field }) => before[field] !== after[field],
  ).map(({ field }) => [field, after[field]]);
  const hasLegacyContact =
    !original.primaryContact &&
    !original.primaryContactId &&
    (original.phone != null || original.email != null);
  const contactChanged = before.phone !== after.phone || before.email !== after.email;
  const migrateContact = hasLegacyContact && contactChanged;
  const paymentChanged =
    before.paymentTerms !== paymentTerms ||
    JSON.stringify(before.paymentSchedule) !== JSON.stringify(paymentSchedule);
  return {
    ...Object.fromEntries(changedFields),
    ...(migrateContact && { phone: after.phone, email: after.email }),
    ...(before.customerType !== after.customerType && { customerType: after.customerType }),
    ...(paymentChanged && { paymentTerms, paymentSchedule }),
  };
};

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
  const paymentError = getCustomerPaymentConfigurationError(customerPaymentConfiguration(values));
  const paymentErrors = paymentError ? [["paymentSchedule", paymentError]] : [];
  return Object.fromEntries([...fieldErrors, ...typeErrors, ...paymentErrors]);
};

export const countCustomerFormErrors = (values: ICreateCustomerPayload) =>
  Object.keys(getCustomerFormErrors(values)).length;

export const getCustomerEditErrors = (
  original: IApiCustomer,
  draft: ICreateCustomerPayload,
): TCustomerFormErrors => {
  const changes = customerFormChanges(original, draft);
  return Object.fromEntries(
    Object.entries(getCustomerFormErrors(draft)).filter(([field]) => field in changes),
  );
};
