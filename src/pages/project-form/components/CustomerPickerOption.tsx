import type { FC } from "react";
import { Box, ButtonBase } from "@mui/material";
import { useStyles } from "./ProjectCustomerPicker.style";
import type { IApiCustomer } from "../../../interfaces/api.interface";
import { CUSTOMER_PICKER_COPY } from "../../../constants/customer.constant";
import CustomerSyncChip from "../../../components/CustomerSyncChip/CustomerSyncChip";
import { formatCustomerContactCount } from "../../../utilities/customer-contact.utility";
import { formatCustomerTaxId, isCustomerSelectable } from "../../../utilities/customer.utility";

interface ICustomerPickerOptionProps {
  customer: IApiCustomer;
  onPick: (customerId: string) => void;
}

const CustomerPickerOption: FC<ICustomerPickerOptionProps> = ({ customer, onPick }) => {
  const styles = useStyles();
  const isSelectable = isCustomerSelectable(customer);

  return (
    <ButtonBase
      role="option"
      aria-selected={false}
      disabled={!isSelectable}
      sx={styles.option(isSelectable)}
      onClick={() => onPick(customer.id)}
    >
      <Box sx={styles.optionText}>
        <Box component="b" sx={styles.optionName}>
          {customer.name}
        </Box>
        <Box component="span" sx={styles.caption}>
          <bdi>{formatCustomerTaxId(customer)}</bdi>
          {` · ${formatCustomerContactCount(customer.contacts ?? [])}`}
        </Box>
      </Box>
      <Box sx={styles.status}>
        <CustomerSyncChip status={customer.prioritySyncStatus} />
        {!isSelectable && (
          <Box component="span" sx={styles.blocked}>
            {CUSTOMER_PICKER_COPY.BLOCKED}
          </Box>
        )}
      </Box>
    </ButtonBase>
  );
};

export default CustomerPickerOption;
