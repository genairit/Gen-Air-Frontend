import { USER_ROLES, type UserRoleType } from "../constants/user-role.constant";

export const mapUserRoles = <TValue>(
  mapRole: (role: UserRoleType) => TValue,
): Record<UserRoleType, TValue> => ({
  secretary: mapRole(USER_ROLES.SECRETARY),
  system_admin: mapRole(USER_ROLES.SYSTEM_ADMIN),
  lead_installer: mapRole(USER_ROLES.LEAD_INSTALLER),
  project_manager: mapRole(USER_ROLES.PROJECT_MANAGER),
});
