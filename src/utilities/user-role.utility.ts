import { USER_ROLES, type ProjectMemberRoleType } from "../constants/user-role.constant";

export const mapProjectMemberRoles = <TValue>(
  mapRole: (role: ProjectMemberRoleType) => TValue,
): Record<ProjectMemberRoleType, TValue> => ({
  engineer: mapRole(USER_ROLES.ENGINEER),
  installer: mapRole(USER_ROLES.INSTALLER),
  secretary: mapRole(USER_ROLES.SECRETARY),
  project_manager: mapRole(USER_ROLES.PROJECT_MANAGER),
});
