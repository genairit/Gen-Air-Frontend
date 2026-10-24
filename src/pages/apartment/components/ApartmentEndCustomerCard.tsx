import type { FC } from "react";
import { Box } from "@mui/material";
import { usePageStyles } from "../../page.style";
import Card from "../../../components/Card/Card";
import Chip from "../../../components/Chip/Chip";
import { ICON_NAMES } from "../../../constants/icon.constant";
import CardHeader from "../../../components/CardHeader/CardHeader";
import DetailTile from "../../../components/DetailTile/DetailTile";
import type { IApiProject } from "../../../interfaces/api.interface";
import { APARTMENT_PAGE_COPY } from "../../../constants/apartment.constant";
import { formatParentCustomerNote } from "../../../utilities/apartment.utility";
import { formatCustomerDetailValue } from "../../../utilities/customer-details.utility";

interface IApartmentEndCustomerCardProps {
  building: IApiProject;
  apartment: IApiProject;
}

const ApartmentEndCustomerCard: FC<IApartmentEndCustomerCardProps> = ({ apartment, building }) => {
  const styles = usePageStyles();
  const hasEndCustomer = Boolean(apartment.customerName);

  return (
    <Card gap="18px">
      <CardHeader
        icon={ICON_NAMES.CUSTOMER}
        title={APARTMENT_PAGE_COPY.END_CUSTOMER_TITLE}
        action={<Chip label={APARTMENT_PAGE_COPY.SEPARATE_FROM_PARENT} />}
      />
      {hasEndCustomer && (
        <Box sx={styles.grid({ minColumnWidth: 180, gap: "14px" })}>
          <DetailTile label={APARTMENT_PAGE_COPY.NAME} value={apartment.customerName ?? ""} />
          <DetailTile
            isLtr
            label={APARTMENT_PAGE_COPY.PHONE}
            value={formatCustomerDetailValue(apartment.customerPhone)}
          />
        </Box>
      )}
      {!hasEndCustomer && (
        <Box component="span" sx={styles.caption}>
          {APARTMENT_PAGE_COPY.NO_END_CUSTOMER}
        </Box>
      )}
      <Box component="span" sx={styles.caption}>
        {formatParentCustomerNote(building)}
      </Box>
    </Card>
  );
};

export default ApartmentEndCustomerCard;
