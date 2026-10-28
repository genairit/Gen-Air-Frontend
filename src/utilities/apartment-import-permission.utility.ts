import { hasPermission } from "./permission.utility";
import { PERMISSIONS } from "../constants/permission.constant";
import type { IApiAuthorizedUser } from "../interfaces/api.interface";

export const canImportApartments = (user: IApiAuthorizedUser | null): boolean => {
  const canCreateApartments = hasPermission(user, PERMISSIONS.APARTMENTS_CREATE);
  const canCreateCustomers = hasPermission(user, PERMISSIONS.CUSTOMERS_CREATE);
  const canUpdateCustomers = hasPermission(user, PERMISSIONS.CUSTOMERS_UPDATE);
  return canCreateApartments && canCreateCustomers && canUpdateCustomers;
};
