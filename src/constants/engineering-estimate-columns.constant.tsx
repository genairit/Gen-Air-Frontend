import type {
  IEstimateListItem,
  IEstimatePricedLine,
} from "../interfaces/engineering-estimate.interface";

import { Box } from "@mui/material";
import Chip from "../components/Chip/Chip";
import { CHIP_SIZES } from "./chip.constant";
import { quotationMoney } from "../utilities/quotation.utility";
import { ESTIMATE_STATUS_LABELS } from "./engineering-estimate.constant";
import type { IDataTableColumn } from "../interfaces/data-table.interface";
import { ESTIMATE_TYPOGRAPHY } from "../styles/engineering-estimate-typography.style";

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

export const ESTIMATE_LIST_COLUMNS: IDataTableColumn<IEstimateListItem>[] = [
  {
    id: "name",
    header: columnHeading("שם כתב הכמויות"),
    track: "minmax(0, 1fr)",
    render: (row): React.JSX.Element => (
      <Box component="strong" sx={ESTIMATE_TYPOGRAPHY.rowName}>
        {row.name}
      </Box>
    ),
  },
  {
    id: "status",
    header: columnHeading("סטטוס"),
    track: "minmax(120px, 0.25fr)",
    render: (row): React.JSX.Element => (
      <Chip
        size={CHIP_SIZES.MEDIUM}
        sx={ESTIMATE_TYPOGRAPHY.status}
        label={ESTIMATE_STATUS_LABELS[row.status]}
      />
    ),
  },
];
