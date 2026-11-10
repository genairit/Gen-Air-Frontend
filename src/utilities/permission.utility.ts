import { USER_ROLES } from "../constants/user-role.constant";
import { PERMISSIONS } from "../constants/permission.constant";
import type { IApiAuthorizedUser } from "../interfaces/api.interface";
import type { PermissionType } from "../constants/permission.constant";

export const hasPermission = (
  user: IApiAuthorizedUser | null,
  permission: PermissionType,
): boolean => user?.permissions?.includes(permission) ?? false;

export const canCancelQuotation = (user: IApiAuthorizedUser | null): boolean =>
  hasPermission(user, PERMISSIONS.QUOTATIONS_UPDATE) &&
  (user?.role === USER_ROLES.ENGINEER || user?.role === USER_ROLES.SYSTEM_ADMIN);

export const canRestoreQuotation = (user: IApiAuthorizedUser | null): boolean =>
  hasPermission(user, PERMISSIONS.QUOTATIONS_UPDATE) && user?.role === USER_ROLES.SYSTEM_ADMIN;
