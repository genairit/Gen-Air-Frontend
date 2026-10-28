import { ROUTE_PATHS } from "./routes.constant";
import { PERMISSIONS, type PermissionType } from "./permission.constant";

export const NAVIGATION_PERMISSIONS: Partial<Record<string, PermissionType>> = {
  [ROUTE_PATHS.BOARD]: PERMISSIONS.PROJECTS_READ,
  [ROUTE_PATHS.CUSTOMERS]: PERMISSIONS.CUSTOMERS_READ,
  [ROUTE_PATHS.TASKS]: PERMISSIONS.TASKS_READ,
  [ROUTE_PATHS.EMPLOYEES]: PERMISSIONS.EMPLOYEES_READ,
};
