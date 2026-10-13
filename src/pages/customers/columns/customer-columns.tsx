import { Box } from "@mui/material";
import { CUSTOMER_COLUMN_STYLES } from "./customer-columns.style";
import type { IApiCustomer } from "../../../interfaces/api.interface";
import { CUSTOMER_TABLE_HEADERS } from "../../../constants/customer.constant";
import type { IDataTableColumn } from "../../../interfaces/data-table.interface";
import CustomerSyncChip from "../../../components/CustomerSyncChip/CustomerSyncChip";
import { formatPriorityId, formatCustomerTaxId } from "../../../utilities/customer.utility";

export const CUSTOMER_TABLE_MIN_WIDTH = 680;

export const CUSTOMER_COLUMNS: IDataTableColumn<IApiCustomer>[] = [
  {
    id: "customer",
    track: "minmax(240px, 2fr)",
    header: CUSTOMER_TABLE_HEADERS.CUSTOMER,
    render: customer => (
      <Box sx={CUSTOMER_COLUMN_STYLES.cell}>
        <Box component="b" sx={CUSTOMER_COLUMN_STYLES.name}>
          {customer.name}
        </Box>
        <Box dir="ltr" component="span" sx={CUSTOMER_COLUMN_STYLES.caption}>
          {formatCustomerTaxId(customer)}
        </Box>
      </Box>
    ),
  },
  {
    id: "contact",
    track: "minmax(180px, 1.4fr)",
    header: CUSTOMER_TABLE_HEADERS.CONTACT,
    render: customer => (
      <Box sx={CUSTOMER_COLUMN_STYLES.cell}>
        <Box component="span" sx={CUSTOMER_COLUMN_STYLES.contactName}>
          {customer.contactName}
        </Box>
        <Box dir="ltr" component="span" sx={CUSTOMER_COLUMN_STYLES.caption}>
          {customer.phone}
        </Box>
      </Box>
    ),
  },
  {
    id: "sync",
    track: "minmax(200px, 1.2fr)",
    header: CUSTOMER_TABLE_HEADERS.SYNC,
    render: customer => (
      <Box sx={CUSTOMER_COLUMN_STYLES.cell}>
        <CustomerSyncChip status={customer.prioritySyncStatus} />
        <Box component="span" sx={CUSTOMER_COLUMN_STYLES.priorityId}>
          {formatPriorityId(customer)}
        </Box>
      </Box>
    ),
  },
];
