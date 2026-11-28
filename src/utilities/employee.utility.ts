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

import { toTelephoneHref } from "./phone.utility";
import { getAssignableRoles } from "./user-role.utility";
import type { TUserRoleCounts } from "../interfaces/api.interface";
import { EMPTY_EMPLOYEE_FORM } from "../constants/employee.constant";
import type { IUserPayload, TUserUpdatePayload } from "../interfaces/api-request.interface";

const NAME_SEPARATOR = /\s+/;

export const getEmployeeId = (employee: IEmployee) => employee.id;

export const isEmployeeDisabled = (employee: IEmployee) => employee.isDisabled;

const splitFullName = (fullName: string) => {
  const [firstName = "", ...lastNameParts] = fullName.trim().split(NAME_SEPARATOR);

  return { firstName, lastName: lastNameParts.join(" ") };
};

export const toEmployeeFormValues = (employee: IEmployee | null): IEmployeeFormValues => {
  if (!employee) {
    return EMPTY_EMPLOYEE_FORM;
  }

  return {
    ...EMPTY_EMPLOYEE_FORM,
    name: employee.person.name,
    phone: employee.phone,
    email: employee.email,
    assignedRoles: getAssignableRoles(employee.assignedRoles),
  };
};

const getNameChanges = (employee: IEmployee, name: string): TUserUpdatePayload => {
  if (employee.person.name.trim() === name) {
    return {};
  }

  const firstNamePrefix = `${employee.firstName} `;
  const lastNameSuffix = ` ${employee.lastName}`;
  if (name.startsWith(firstNamePrefix)) {
    return { lastName: name.slice(firstNamePrefix.length).trim() };
  }

  if (name.endsWith(lastNameSuffix)) {
    return { firstName: name.slice(0, -lastNameSuffix.length).trim() };
  }

  const { firstName, lastName } = splitFullName(name);
  return {
    ...(firstName !== employee.firstName && { firstName }),
    ...(lastName !== employee.lastName && { lastName }),
  };
};

export const toEmployeeUpdatePayload = (
  employee: IEmployee,
  values: IEmployeeFormValues,
): TUserUpdatePayload => {
  const email = values.email.trim();
  const phone = values.phone.trim();
  const originalRoles = getAssignableRoles(employee.assignedRoles);
  const rolesChanged =
    originalRoles.length !== values.assignedRoles.length ||
    originalRoles.some(role => !values.assignedRoles.includes(role));

  return {
    ...getNameChanges(employee, values.name.trim()),
    ...(email !== employee.email.trim() && { email }),
    ...(phone !== employee.phone.trim() && { phone }),
    ...(rolesChanged && { assignedRoles: values.assignedRoles }),
  };
};

export const canSubmitEmployeeUpdate = (
  changes: TUserUpdatePayload,
  values: IEmployeeFormValues,
) => {
  const validName = changes.firstName !== "" && changes.lastName !== "";
  const validEmail = changes.email == null || validateEmail(changes.email).isValid;
  const validPhone = changes.phone == null || validatePhoneNumber(changes.phone).isValid;
  const hasChanges = Object.keys(changes).length > 0;

  return hasChanges && validName && validEmail && validPhone && values.assignedRoles.length > 0;
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

export const callPhoneNumber = (phone: string) => window.location.assign(toTelephoneHref(phone));
