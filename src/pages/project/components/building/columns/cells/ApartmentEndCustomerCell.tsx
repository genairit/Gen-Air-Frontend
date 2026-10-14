import type { FC } from "react";
import { Box } from "@mui/material";
import { APARTMENT_COLUMN_STYLES } from "../apartment-columns.style";
import type { IApiProject } from "../../../../../../interfaces/api.interface";
import { formatEndCustomer } from "../../../../../../utilities/apartment.utility";

interface IApartmentEndCustomerCellProps {
  apartment: IApiProject;
}

const ApartmentEndCustomerCell: FC<IApartmentEndCustomerCellProps> = ({ apartment }) => {
  const hasEndCustomer = Boolean(apartment.customerName);
  const textStyle = hasEndCustomer
    ? APARTMENT_COLUMN_STYLES.text
    : APARTMENT_COLUMN_STYLES.mutedText;

  return (
    <Box sx={textStyle} component="span">
      {formatEndCustomer(apartment)}
    </Box>
  );
};

export default ApartmentEndCustomerCell;
