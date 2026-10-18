import type { FC } from "react";
import { Box } from "@mui/material";
import { usePageStyles } from "../../page.style";
import Card from "../../../components/Card/Card";
import { ICON_NAMES } from "../../../constants/icon.constant";
import CardHeader from "../../../components/CardHeader/CardHeader";
import DetailTile from "../../../components/DetailTile/DetailTile";
import type { IApiProject } from "../../../interfaces/api.interface";
import { APARTMENT_PAGE_COPY } from "../../../constants/apartment.constant";
import { formatCustomerDetailValue } from "../../../utilities/customer-details.utility";

interface IApartmentContactCardProps {
  apartment: IApiProject;
}

const ApartmentContactCard: FC<IApartmentContactCardProps> = ({ apartment }) => {
  const styles = usePageStyles();

  return (
    <Card gap="18px">
      <CardHeader
        icon={ICON_NAMES.CONTACTS}
        title={APARTMENT_PAGE_COPY.CONTACT_TITLE}
        subtitle={APARTMENT_PAGE_COPY.CONTACT_SUBTITLE}
      />
      <Box sx={styles.grid({ minColumnWidth: 180, gap: "14px" })}>
        <DetailTile
          label={APARTMENT_PAGE_COPY.CONTACT_NAME}
          value={formatCustomerDetailValue(apartment.contactName)}
        />
        <DetailTile
          isLtr
          label={APARTMENT_PAGE_COPY.CONTACT_PHONE}
          value={formatCustomerDetailValue(apartment.contactPhone)}
        />
      </Box>
    </Card>
  );
};

export default ApartmentContactCard;
