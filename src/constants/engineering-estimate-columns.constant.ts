import { quotationMoney } from "../utilities/quotation.utility";
import type { IDataTableColumn } from "../interfaces/data-table.interface";
import type { IEstimatePricedLine } from "../interfaces/engineering-estimate.interface";

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
