import type { FC } from "react";
import { Box } from "@mui/material";
import Card from "../../../components/Card/Card";
import { useStyles } from "./CustomerHeaderCard.style";
import IconTile from "../../../components/IconTile/IconTile";
import { ICON_NAMES } from "../../../constants/icon.constant";
import { SURFACE_DEPTHS } from "../../../constants/surface.constant";
import type { IApiCustomer } from "../../../interfaces/api.interface";
import { ICON_TILE_SIZES } from "../../../constants/icon-tile.constant";
import { formatCustomerCreatedCaption } from "../../../utilities/customer.utility";
import CustomerSyncChip from "../../../components/CustomerSyncChip/CustomerSyncChip";

interface ICustomerHeaderCardProps {
  customer: IApiCustomer;
}

const CustomerHeaderCard: FC<ICustomerHeaderCardProps> = ({ customer }) => {
  const styles = useStyles();

  return (
    <Card gap="20px" padding="24px" sx={styles.card}>
      <Box sx={styles.identity}>
        <IconTile
          name={ICON_NAMES.CUSTOMER}
          size={ICON_TILE_SIZES.LARGE}
          depth={SURFACE_DEPTHS.INSET}
        />
        <Box sx={styles.details}>
          <Box sx={styles.titleRow}>
            <Box component="h3" sx={styles.title}>
              {customer.name}
            </Box>
            <CustomerSyncChip status={customer.prioritySyncStatus} />
          </Box>
          <Box component="span" sx={styles.caption}>
            {formatCustomerCreatedCaption(customer)}
          </Box>
        </Box>
      </Box>
    </Card>
  );
};

export default CustomerHeaderCard;
