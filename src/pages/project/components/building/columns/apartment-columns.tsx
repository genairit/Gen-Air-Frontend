import {
  formatFloor,
  formatEndCustomer,
  formatApartmentNumber,
} from "../../../../../utilities/apartment.utility";

import { Box } from "@mui/material";
import ApartmentStageChip from "../ApartmentStageChip";
import CheckBox from "../../../../../components/CheckBox/CheckBox";
import { APARTMENT_COLUMN_STYLES } from "./apartment-columns.style";
import { APARTMENT_TABLE_HEADERS } from "../../../../../constants/apartment.constant";
import type { IDataTableColumn } from "../../../../../interfaces/data-table.interface";
import type { IApartmentSelection } from "../../../../../interfaces/apartment.interface";
import type { IApiProject, IApiProjectStage } from "../../../../../interfaces/api.interface";

export const APARTMENT_TABLE_MIN_WIDTH = 720;

interface IApartmentColumnsOptions {
  stages: IApiProjectStage[];
  selection: IApartmentSelection | null;
}

const stopRowClick = (event: { stopPropagation: () => void }) => event.stopPropagation();

const buildSelectColumn = (selection: IApartmentSelection): IDataTableColumn<IApiProject> => ({
  id: "select",
  track: "44px",
  header: <CheckBox text="" onChange={selection.toggleAll} value={selection.isAllSelected} />,
  render: apartment => (
    <Box onClick={stopRowClick} sx={APARTMENT_COLUMN_STYLES.selectCell}>
      <CheckBox
        text=""
        value={selection.isSelected(apartment.id)}
        onChange={() => selection.toggle(apartment.id)}
      />
    </Box>
  ),
});

const buildDetailColumns = (stages: IApiProjectStage[]): IDataTableColumn<IApiProject>[] => [
  {
    id: "apartment",
    track: "minmax(140px, 1fr)",
    header: APARTMENT_TABLE_HEADERS.APARTMENT,
    render: apartment => (
      <Box sx={APARTMENT_COLUMN_STYLES.cell}>
        <Box component="b" sx={APARTMENT_COLUMN_STYLES.title}>
          {formatApartmentNumber(apartment)}
        </Box>
        <Box component="span" sx={APARTMENT_COLUMN_STYLES.caption}>
          {formatFloor(apartment)}
        </Box>
      </Box>
    ),
  },
  {
    id: "endCustomer",
    track: "minmax(160px, 1.3fr)",
    header: APARTMENT_TABLE_HEADERS.END_CUSTOMER,
    render: apartment => (
      <Box
        component="span"
        sx={
          apartment.customerName ? APARTMENT_COLUMN_STYLES.text : APARTMENT_COLUMN_STYLES.mutedText
        }
      >
        {formatEndCustomer(apartment)}
      </Box>
    ),
  },
  {
    id: "contact",
    track: "minmax(160px, 1.3fr)",
    header: APARTMENT_TABLE_HEADERS.CONTACT,
    render: apartment => (
      <Box sx={APARTMENT_COLUMN_STYLES.cell}>
        <Box component="span" sx={APARTMENT_COLUMN_STYLES.text}>
          {apartment.contactName}
        </Box>
        <Box dir="ltr" component="span" sx={APARTMENT_COLUMN_STYLES.caption}>
          {apartment.contactPhone}
        </Box>
      </Box>
    ),
  },
  {
    id: "stage",
    track: "minmax(150px, 1fr)",
    header: APARTMENT_TABLE_HEADERS.STAGE,
    render: apartment => <ApartmentStageChip stages={stages} apartment={apartment} />,
  },
];

export const buildApartmentColumns = ({ stages, selection }: IApartmentColumnsOptions) => {
  const detailColumns = buildDetailColumns(stages);

  if (!selection) {
    return detailColumns;
  }

  return [buildSelectColumn(selection), ...detailColumns];
};
