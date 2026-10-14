import type { FC } from "react";
import { Box } from "@mui/material";
import { APARTMENT_COLUMN_STYLES } from "../apartment-columns.style";
import type { IApiProject } from "../../../../../../interfaces/api.interface";
import { formatFloor, formatApartmentNumber } from "../../../../../../utilities/apartment.utility";

interface IApartmentUnitCellProps {
  apartment: IApiProject;
}

const ApartmentUnitCell: FC<IApartmentUnitCellProps> = ({ apartment }) => (
  <Box sx={APARTMENT_COLUMN_STYLES.cell}>
    <Box component="b" sx={APARTMENT_COLUMN_STYLES.title}>
      {formatApartmentNumber(apartment)}
    </Box>
    <Box component="span" sx={APARTMENT_COLUMN_STYLES.caption}>
      {formatFloor(apartment)}
    </Box>
  </Box>
);

export default ApartmentUnitCell;
