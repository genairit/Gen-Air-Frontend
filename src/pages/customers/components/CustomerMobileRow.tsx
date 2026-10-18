import type { FC } from "react";
import { Box } from "@mui/material";
import Card from "../../../components/Card/Card";
import type { IApiCustomer } from "../../../interfaces/api.interface";
import { formatPriorityId } from "../../../utilities/customer.utility";
import { CUSTOMER_COLUMN_STYLES } from "../columns/customer-columns.style";
import CustomerSyncChip from "../../../components/CustomerSyncChip/CustomerSyncChip";

interface ICustomerMobileRowProps {
  customer: IApiCustomer;
  onOpen: (customer: IApiCustomer) => void;
}

const CustomerMobileRow: FC<ICustomerMobileRowProps> = ({ customer, onOpen }) => (
  <Card gap="10px" padding="16px" onClick={() => onOpen(customer)}>
    <Box component="b" sx={CUSTOMER_COLUMN_STYLES.name}>
      {customer.name}
    </Box>
    <Box component="span" sx={CUSTOMER_COLUMN_STYLES.caption}>
      {`${customer.contactName} · `}
      <bdi dir="ltr">{customer.phone}</bdi>
    </Box>
    <Box sx={CUSTOMER_COLUMN_STYLES.syncRow}>
      <CustomerSyncChip status={customer.prioritySyncStatus} />
      <Box component="span" sx={CUSTOMER_COLUMN_STYLES.priorityId}>
        {formatPriorityId(customer)}
      </Box>
    </Box>
  </Card>
);

export default CustomerMobileRow;
