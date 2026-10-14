import type { FC } from "react";
import { Box } from "@mui/material";
import { APARTMENT_COLUMN_STYLES } from "../apartment-columns.style";
import type { IApiProject } from "../../../../../../interfaces/api.interface";

interface IApartmentContactCellProps {
  apartment: IApiProject;
}

const ApartmentContactCell: FC<IApartmentContactCellProps> = ({ apartment }) => (
  <Box sx={APARTMENT_COLUMN_STYLES.cell}>
    <Box component="span" sx={APARTMENT_COLUMN_STYLES.text}>
      {apartment.contactName}
    </Box>
    <Box dir="ltr" component="span" sx={APARTMENT_COLUMN_STYLES.caption}>
      {apartment.contactPhone}
    </Box>
  </Box>
);

export default ApartmentContactCell;
