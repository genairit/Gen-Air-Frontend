import {
  USER_ROLES,
  type UserRoleType,
  type ProjectMemberRoleType,
} from "../constants/user-role.constant";

import type { IApiUser } from "../interfaces/api.interface";

export const getAssignedRoles = (user: Pick<IApiUser, "assignedRoles" | "role">): UserRoleType[] =>
  user.assignedRoles ?? [user.role];

export const getUsersAssignedToRole = (users: IApiUser[], role: UserRoleType): IApiUser[] =>
  users.filter(user => getAssignedRoles(user).includes(role));

export const mapProjectMemberRoles = <TValue>(
  mapRole: (role: ProjectMemberRoleType) => TValue,
): Record<ProjectMemberRoleType, TValue> => ({
  engineer: mapRole(USER_ROLES.ENGINEER),
  installer: mapRole(USER_ROLES.INSTALLER),
  secretary: mapRole(USER_ROLES.SECRETARY),
  project_manager: mapRole(USER_ROLES.PROJECT_MANAGER),
});
