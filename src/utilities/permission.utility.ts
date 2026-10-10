import type { IApiUser } from "../interfaces/api.interface";
import { ROLE_PERMISSIONS, type PermissionType } from "../constants/user-role.constant";

export const hasPermission = (user: IApiUser | null, permission: PermissionType) => {
  if (!user) {
    return false;
  }

  const allowedRoles: readonly string[] = ROLE_PERMISSIONS[permission];

  return allowedRoles.includes(user.role);
};
