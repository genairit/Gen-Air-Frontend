import { CATALOGUE_STATUS } from "../../constants/quotation.constant";
import type { ICatalogueItem } from "../../interfaces/quotation.interface";

const currencyFormat = new Intl.NumberFormat("he-IL", {
  style: "currency",
  currency: "ILS",
  maximumFractionDigits: 4,
});
const capacityFormat = new Intl.NumberFormat("he-IL");

export const cataloguePrice = (price: string) => currencyFormat.format(Number(price));
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
