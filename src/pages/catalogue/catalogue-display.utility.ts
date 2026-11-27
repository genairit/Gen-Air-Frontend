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
const STATUS_LABELS: Partial<Record<string, string>> = {
  [CATALOGUE_STATUS.NO_SELL]: "לא למכירה",
  [CATALOGUE_STATUS.CONFLICT]: "מק״ט כפול",
  [CATALOGUE_STATUS.ARCHIVED]: "בארכיון",
};
export const catalogueStatusLabel = (status: string) => STATUS_LABELS[status] ?? null;

export const catalogueDetailRows = (item: ICatalogueItem) => [
  { label: "מק״ט", value: item.sku },
  { label: "יחידת מידה", value: item.unit || "—" },
  { label: "תפוקה (BTU)", value: catalogueCapacity(item.capacityBtu) },
  { label: "מחיר ליחידה (₪)", value: cataloguePrice(item.price) },
  { label: "חברת מיזוג", value: item.brand || "—" },
  { label: "סטטוס", value: catalogueStatusLabel(item.status) ?? "פעיל" },
];
export const catalogueRowLabel = (item: ICatalogueItem) =>
  `פתיחת פריט ${item.sku}${item.description ? ` · ${item.description}` : ""}`;
