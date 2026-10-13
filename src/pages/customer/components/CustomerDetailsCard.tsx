import type { FC } from "react";
import { Box } from "@mui/material";
import { usePageStyles } from "../../page.style";
import Card from "../../../components/Card/Card";
import { ICON_NAMES } from "../../../constants/icon.constant";
import DetailTile from "../../../components/DetailTile/DetailTile";
import CardHeader from "../../../components/CardHeader/CardHeader";
import type { IApiCustomer } from "../../../interfaces/api.interface";
import { CUSTOMER_PAGE_COPY, CUSTOMER_DETAIL_FIELDS } from "../../../constants/customer.constant";

interface ICustomerDetailsCardProps {
  customer: IApiCustomer;
}

const CustomerDetailsCard: FC<ICustomerDetailsCardProps> = ({ customer }) => {
  const pageStyles = usePageStyles();

  return (
    <Card gap="18px" padding="24px">
      <CardHeader
        icon={ICON_NAMES.INFO}
        title={CUSTOMER_PAGE_COPY.DETAILS_TITLE}
        subtitle={CUSTOMER_PAGE_COPY.DETAILS_SUBTITLE}
      />
      <Box sx={pageStyles.grid({ minColumnWidth: 220, gap: "14px" })}>
        {CUSTOMER_DETAIL_FIELDS.map(config => (
          <DetailTile
            key={config.field}
            label={config.label}
            isLtr={config.isLtr}
            value={customer[config.field]}
          />
        ))}
      </Box>
    </Card>
  );
};

export default CustomerDetailsCard;
