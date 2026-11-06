import {
  validateEmail,
  validatePassword,
  validatePhoneNumber,
  createPasswordConfirmationValidator,
} from "./validators";

import type {
  IEmployee,
  IEmployeeFilter,
  IEmployeeFormValues,
} from "../interfaces/employee.interface";

import type { TUserRoleCounts } from "../interfaces/api.interface";
import type { IUserPayload } from "../interfaces/api-request.interface";

const NAME_SEPARATOR = /\s+/;

export const getEmployeeId = (employee: IEmployee) => employee.id;

export const isEmployeeDisabled = (employee: IEmployee) => employee.isDisabled;

const splitFullName = (fullName: string) => {
  const [firstName = "", ...lastNameParts] = fullName.trim().split(NAME_SEPARATOR);

  return { firstName, lastName: lastNameParts.join(" ") };
};

export const canSubmitEmployeeForm = (values: IEmployeeFormValues) => {
  const { firstName, lastName } = splitFullName(values.name);
  const hasFullName = Boolean(firstName) && Boolean(lastName);
  const hasValidEmail = validateEmail(values.email).isValid;
  const hasValidPhone = validatePhoneNumber(values.phone).isValid;
  const hasValidPassword = validatePassword(values.password).isValid;
  const hasMatchingConfirmation = createPasswordConfirmationValidator(values.password)(
    values.passwordConfirmation,
  ).isValid;
  const hasAssignedRoles = values.assignedRoles.length > 0;

  return (
    hasFullName &&
    hasValidEmail &&
    hasValidPhone &&
    hasValidPassword &&
    hasMatchingConfirmation &&
    hasAssignedRoles
  );
};

export const toUserPayload = (values: IEmployeeFormValues): IUserPayload => ({
  ...splitFullName(values.name),
  assignedRoles: values.assignedRoles,
  password: values.password,
  email: values.email.trim(),
  phone: values.phone.trim(),
});

export const countUsersForFilter = (
  roleCounts: TUserRoleCounts | null,
  filter: IEmployeeFilter,
): number => {
  if (!roleCounts) {
    return 0;
  }

  if (!filter.role) {
    return roleCounts.total;
  }

  return roleCounts[filter.role];
};

export const toTelephoneHref = (phone: string) => `tel:${phone.replace(/-/g, "")}`;

export const callPhoneNumber = (phone: string) => window.location.assign(toTelephoneHref(phone));
