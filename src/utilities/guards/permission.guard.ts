import { PERMISSION_VALUES, type PermissionType } from "../../constants/permission.constant";

export const isPermission = (value: unknown): value is PermissionType =>
  PERMISSION_VALUES.some(permission => permission === value);
