import type { FC } from "react";
import { Box } from "@mui/material";
import { useStyles } from "./ProjectCustomerPicker.style";
import ChoiceRow from "../../../components/ChoiceRow/ChoiceRow";
import type { IApiCustomer } from "../../../interfaces/api.interface";
import { CUSTOMER_PICKER_COPY } from "../../../constants/customer.constant";
import CustomerSyncChip from "../../../components/CustomerSyncChip/CustomerSyncChip";
import { formatCustomerTaxId, isCustomerSelectable } from "../../../utilities/customer.utility";

interface ICustomerPickerOptionProps {
  customer: IApiCustomer;
  onPick: (customerId: string) => void;
}

const CustomerPickerOption: FC<ICustomerPickerOptionProps> = ({ customer, onPick }) => {
  const styles = useStyles();
  const isSelectable = isCustomerSelectable(customer);

  return (
    <ChoiceRow
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
          <Box component="bdi">{formatCustomerTaxId(customer)}</Box>
          {customer.primaryContact && ` · ${customer.primaryContact.name}`}
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
    </ChoiceRow>
  );
};

export default CustomerPickerOption;
