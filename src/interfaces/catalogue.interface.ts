import type { ICatalogueItem } from "./quotation.interface";

export interface ICatalogueDirectoryQuery {
  search: string;
  canManage: boolean;
  pricedOnly: boolean;
}
export type TCatalogueItemChanges = Pick<
  ICatalogueItem,
  | "description"
  | "unit"
  | "price"
  | "capacityBtu"
  | "equipmentRole"
  | "includesRemote"
  | "includesThermostat"
>;
export type TCatalogueCreate = TCatalogueItemChanges &
  Pick<ICatalogueItem, "sku" | "brand" | "systemType">;
export type TCatalogueForm = Omit<TCatalogueCreate, "capacityBtu"> & { capacityBtu: string };
export type TCatalogueErrors = Partial<Record<keyof TCatalogueForm, string>>;
