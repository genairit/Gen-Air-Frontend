import { hasPermission } from "./permission.utility";
import type { IApiUser } from "../interfaces/api.interface";

export const canImportApartments = (user: IApiUser | null): boolean => {
  const canEditProjects = hasPermission(user, "EDIT_PROJECTS");
  const canManageCustomers = hasPermission(user, "MANAGE_CUSTOMERS");
  return canEditProjects && canManageCustomers;
};
