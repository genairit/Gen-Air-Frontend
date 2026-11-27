import { quotationMoney } from "../utilities/quotation.utility";
import { ESTIMATE_STATUS_LABELS } from "./engineering-estimate.constant";
import type { IDataTableColumn } from "../interfaces/data-table.interface";
import type {
  IEstimateListItem,
  IEstimatePricedLine,
} from "../interfaces/engineering-estimate.interface";

export const ESTIMATE_COLUMNS: IDataTableColumn<IEstimatePricedLine>[] = [
  { id: "sku", header: "מק״ט", track: "minmax(115px, 0.7fr)", render: (line): string => line.sku },
  {
    id: "description",
    header: "פריט",
    track: "minmax(200px, 1fr)",
    render: (line): string => line.description,
  },
  {
    id: "source",
    header: "מקור",
    track: "minmax(90px, 0.6fr)",
    render: (line): string => line.provenance ?? (line.source === "rule" ? "לפי כלל" : "ידני"),
  },
  {
    id: "quantity",
    header: "כמות כוללת",
    track: "minmax(125px, 0.7fr)",
    render: (line): string => `${line.quantity} ${line.unit}`,
  },
  {
    id: "unitPrice",
    header: "מחיר יחידה",
    track: "minmax(115px, 0.7fr)",
    render: (line): string =>
      line.unitPrice === null ? "חסר מחיר" : quotationMoney(line.unitPrice),
  },
  {
    id: "total",
    header: "סה״כ",
    track: "minmax(115px, 0.7fr)",
    render: (line): string => (line.total === null ? "—" : quotationMoney(line.total)),
  },
];

export const ESTIMATE_LIST_COLUMNS: IDataTableColumn<IEstimateListItem>[] = [
  { id: "name", header: "שם כתב הכמויות", track: "minmax(0, 1fr)", render: row => row.name },
  {
    id: "status",
    header: "סטטוס",
    track: "minmax(75px, 0.25fr)",
    render: row => ESTIMATE_STATUS_LABELS[row.status],
  },
];
