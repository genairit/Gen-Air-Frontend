import { hasPermission } from "./permission.utility";
import type { IApiAuthorizedUser } from "../interfaces/api.interface";
import type { INavigationItem } from "../interfaces/navigation-item.interface";
import { NAVIGATION_PERMISSIONS } from "../constants/navigation-permission.constant";

export const filterNavigationByPermissions = (
  items: INavigationItem[],
  user: IApiAuthorizedUser | null,
): INavigationItem[] =>
  items.filter(item => {
    const permission = NAVIGATION_PERMISSIONS[item.id];

    return permission == null || hasPermission(user, permission);
  });
