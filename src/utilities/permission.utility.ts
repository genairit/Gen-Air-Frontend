import type { IApiAuthorizedUser } from "../interfaces/api.interface";
import type { PermissionType } from "../constants/permission.constant";

export const hasPermission = (
  user: IApiAuthorizedUser | null,
  permission: PermissionType,
): boolean => user?.permissions?.includes(permission) ?? false;
