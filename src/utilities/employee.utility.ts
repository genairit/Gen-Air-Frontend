import type {
  IEmployee,
  IEmployeeFilter,
  IEmployeeFormValues,
} from "../interfaces/employee.interface";

import type { TUserRoleCounts } from "../interfaces/api.interface";
import type { UserRoleType } from "../constants/user-role.constant";
import { validateEmail, validatePassword, validatePhoneNumber } from "./validators";
import type { IUserPayload, IUserRoleUpdatePayload } from "../interfaces/api-request.interface";

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
  const activeRole = getActiveEmployeeRole(values);
  const hasAssignedRoles = values.assignedRoles.length > 0;
  const activeRoleIsAssigned = activeRole !== null && values.assignedRoles.includes(activeRole);

  return (
    hasFullName &&
    hasValidEmail &&
    hasValidPhone &&
    hasValidPassword &&
    hasAssignedRoles &&
    activeRoleIsAssigned
  );
};

export const toUserPayload = (values: IEmployeeFormValues): IUserPayload => ({
  ...splitFullName(values.name),
  ...getRoleAssignmentPayload(values),
  password: values.password,
  email: values.email.trim(),
  phone: values.phone.trim(),
});

export const getActiveEmployeeRole = (
  values: Pick<IEmployeeFormValues, "role" | "assignedRoles">,
): UserRoleType | null => {
  if (values.assignedRoles.length === 1) {
    return values.assignedRoles[0] ?? null;
  }

  return values.role;
};

const getRoleAssignmentPayload = (
  values: Pick<IEmployeeFormValues, "role" | "assignedRoles">,
): IUserRoleUpdatePayload => {
  const activeRole = getActiveEmployeeRole(values);

  if (activeRole === null) {
    throw new Error("Choose an active role before saving this employee");
  }

  return { role: activeRole, assignedRoles: values.assignedRoles };
};

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
