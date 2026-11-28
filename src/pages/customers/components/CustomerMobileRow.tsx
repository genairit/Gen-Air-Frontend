import { Box } from "@mui/material";
import type { FC, ReactNode } from "react";
import Card from "../../../components/Card/Card";
import type { IApiCustomer } from "../../../interfaces/api.interface";
import { formatPriorityId } from "../../../utilities/customer.utility";
import { CUSTOMER_COLUMN_STYLES } from "../columns/customer-columns.style";
import CustomerSyncChip from "../../../components/CustomerSyncChip/CustomerSyncChip";
import { formatCustomerContactDetails } from "../../../utilities/customer-contact.utility";

interface ICustomerMobileRowProps {
  action?: ReactNode;
  customer: IApiCustomer;
  onOpen: (customer: IApiCustomer) => void;
}

const CustomerMobileRow: FC<ICustomerMobileRowProps> = ({ customer, onOpen, action }) => (
  <Card gap="10px" padding="16px" ariaLabel={customer.name} onClick={() => onOpen(customer)}>
    <Box sx={CUSTOMER_COLUMN_STYLES.nameRow}>
      <Box component="b" sx={CUSTOMER_COLUMN_STYLES.name}>
        {customer.name}
      </Box>
      {action}
    </Box>
    <Box dir="ltr" component="bdi" sx={CUSTOMER_COLUMN_STYLES.caption}>
      {formatCustomerContactDetails(customer.primaryContact ?? null)}
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
