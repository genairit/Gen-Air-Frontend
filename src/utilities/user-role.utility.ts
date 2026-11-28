import {
  USER_ROLES,
  type UserRoleType,
  type ProjectMemberRoleType,
  ASSIGNABLE_USER_ROLE_VALUES,
} from "../constants/user-role.constant";

import type { IApiUser } from "../interfaces/api.interface";

export const getAssignedRoles = (user: Pick<IApiUser, "assignedRoles" | "role">): UserRoleType[] =>
  user.assignedRoles ?? [user.role];

export const getAssignableRoles = (roles: UserRoleType[]) =>
  roles.filter(role => ASSIGNABLE_USER_ROLE_VALUES.includes(role));

export const hasEngineeringRole = (user: Pick<IApiUser, "assignedRoles" | "role">): boolean =>
  getAssignedRoles(user).some(
    role => role === USER_ROLES.ENGINEER || role === USER_ROLES.ENGINEERING_LEAD,
  );

export const getUsersAssignedToRole = (users: IApiUser[], role: UserRoleType): IApiUser[] =>
  users.filter(user =>
    role === USER_ROLES.ENGINEER ? hasEngineeringRole(user) : getAssignedRoles(user).includes(role),
  );

export const mapProjectMemberRoles = <TValue>(
  mapRole: (role: ProjectMemberRoleType) => TValue,
): Record<ProjectMemberRoleType, TValue> => ({
  engineer: mapRole(USER_ROLES.ENGINEER),
  installer: mapRole(USER_ROLES.INSTALLER),
  secretary: mapRole(USER_ROLES.SECRETARY),
  project_manager: mapRole(USER_ROLES.PROJECT_MANAGER),
});
