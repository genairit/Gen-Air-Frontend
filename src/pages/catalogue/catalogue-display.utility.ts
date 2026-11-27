import { CATALOGUE_STATUS } from "../../constants/quotation.constant";
import type { ICatalogueItem } from "../../interfaces/quotation.interface";

const capacityFormat = new Intl.NumberFormat("he-IL");

export const cataloguePrice = (price: string) => {
  const [whole, decimal = ""] = price.split(".");
  const fraction = decimal.replace(/0+$/, "").padEnd(2, "0");
  return `₪${BigInt(whole).toLocaleString("he-IL")}.${fraction}`;
};
export const catalogueCapacity = (btu: number | null) =>
  btu === null ? "—" : `${capacityFormat.format(btu)} BTU`;
export const catalogueStatusLabel = (status: string) =>
  status === CATALOGUE_STATUS.NO_SELL
    ? "לא למכירה"
    : status === CATALOGUE_STATUS.CONFLICT
      ? "מק״ט כפול"
      : status === CATALOGUE_STATUS.ARCHIVED
        ? "בארכיון"
        : null;
export const catalogueRowLabel = (item: ICatalogueItem) =>
  `פתיחת פריט ${item.sku}${item.description ? ` · ${item.description}` : ""}`;
