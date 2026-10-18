import ApartmentStageChip from "../ApartmentStageChip";
import ApartmentUnitCell from "./cells/ApartmentUnitCell";
import ApartmentSelectCell from "./cells/ApartmentSelectCell";
import ApartmentContactCell from "./cells/ApartmentContactCell";
import CheckBox from "../../../../../components/CheckBox/CheckBox";
import ApartmentEndCustomerCell from "./cells/ApartmentEndCustomerCell";
import { APARTMENT_TABLE_HEADERS } from "../../../../../constants/apartment.constant";
import type { IDataTableColumn } from "../../../../../interfaces/data-table.interface";
import type { IApartmentSelection } from "../../../../../interfaces/apartment.interface";
import type { IApiProject, IApiProjectStage } from "../../../../../interfaces/api.interface";

export const APARTMENT_TABLE_MIN_WIDTH = 720;

interface IApartmentColumnsOptions {
  stages: IApiProjectStage[];
  selection: IApartmentSelection | null;
}

const buildSelectColumn = (selection: IApartmentSelection): IDataTableColumn<IApiProject> => ({
  id: "select",
  track: "44px",
  header: <CheckBox text="" onChange={selection.toggleAll} value={selection.isAllSelected} />,
  render: apartment => (
    <ApartmentSelectCell
      isSelected={selection.isSelected(apartment.id)}
      onToggle={() => selection.toggle(apartment.id)}
    />
  ),
});

const buildDetailColumns = (stages: IApiProjectStage[]): IDataTableColumn<IApiProject>[] => [
  {
    id: "apartment",
    track: "minmax(140px, 1fr)",
    header: APARTMENT_TABLE_HEADERS.APARTMENT,
    render: apartment => <ApartmentUnitCell apartment={apartment} />,
  },
  {
    id: "endCustomer",
    track: "minmax(160px, 1.3fr)",
    header: APARTMENT_TABLE_HEADERS.END_CUSTOMER,
    render: apartment => <ApartmentEndCustomerCell apartment={apartment} />,
  },
  {
    id: "contact",
    track: "minmax(160px, 1.3fr)",
    header: APARTMENT_TABLE_HEADERS.CONTACT,
    render: apartment => <ApartmentContactCell apartment={apartment} />,
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
