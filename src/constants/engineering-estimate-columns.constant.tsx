import { Box } from "@mui/material";
import { quotationMoney } from "../utilities/quotation.utility";
import type { IDataTableColumn } from "../interfaces/data-table.interface";
import { ESTIMATE_TYPOGRAPHY } from "../styles/engineering-estimate-typography.style";
import type { IEstimatePricedLine } from "../interfaces/engineering-estimate.interface";

const columnHeading = (label: string): React.JSX.Element => (
  <Box component="span" sx={ESTIMATE_TYPOGRAPHY.columnHeader}>
    {label}
  </Box>
);

const amount = (value: string): React.JSX.Element => (
  <Box component="bdi" sx={ESTIMATE_TYPOGRAPHY.number}>
    {value}
  </Box>
);

export const ESTIMATE_COLUMNS: IDataTableColumn<IEstimatePricedLine>[] = [
  {
    id: "sku",
    header: columnHeading("מק״ט"),
    track: "minmax(115px, 0.7fr)",
    render: (line): React.JSX.Element => amount(line.sku),
  },
  {
    id: "description",
    header: columnHeading("פריט"),
    track: "minmax(200px, 1fr)",
    render: (line): React.JSX.Element => (
      <Box component="span" sx={ESTIMATE_TYPOGRAPHY.rowValue}>
        {line.description}
      </Box>
    ),
  },
  {
    id: "source",
    header: columnHeading("מקור"),
    track: "minmax(90px, 0.6fr)",
    render: (line): string => line.provenance ?? (line.source === "rule" ? "לפי כלל" : "ידני"),
  },
  {
    id: "quantity",
    header: columnHeading("כמות כוללת"),
    track: "minmax(125px, 0.7fr)",
    render: (line): React.JSX.Element => amount(`${line.quantity} ${line.unit}`),
  },
  {
    id: "unitPrice",
    header: columnHeading("מחיר יחידה"),
    track: "minmax(115px, 0.7fr)",
    render: (line): React.JSX.Element =>
      line.unitPrice === null ? (
        <Box component="span" sx={ESTIMATE_TYPOGRAPHY.missing}>
          חסר מחיר
        </Box>
      ) : (
        amount(quotationMoney(line.unitPrice))
      ),
  },
  {
    id: "total",
    header: columnHeading("סה״כ"),
    track: "minmax(115px, 0.7fr)",
    render: (line): React.JSX.Element =>
      amount(line.total === null ? "—" : quotationMoney(line.total)),
  },
];
