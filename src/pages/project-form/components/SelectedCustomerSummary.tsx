import type { FC } from "react";
import { Box } from "@mui/material";
import { Link } from "react-router-dom";
import Button from "../../../components/Button/Button";
import { useStyles } from "./ProjectCustomerPicker.style";
import { buildCustomerPath } from "../../../utilities/route.utility";
import type { IApiCustomer } from "../../../interfaces/api.interface";
import { CUSTOMER_PICKER_COPY } from "../../../constants/customer.constant";
import CustomerSyncChip from "../../../components/CustomerSyncChip/CustomerSyncChip";
import { BUTTON_VARIANTS } from "../../../components/Button/constants/button.constants";
import {
  formatCustomerTaxId,
  formatCustomerContactLine,
} from "../../../utilities/customer.utility";

interface ISelectedCustomerSummaryProps {
  onReplace: () => void;
  customer: IApiCustomer;
}

const SelectedCustomerSummary: FC<ISelectedCustomerSummaryProps> = ({ customer, onReplace }) => {
  const styles = useStyles();

  return (
    <Box sx={styles.selected}>
      <Box sx={styles.selectedText}>
        <Box component="b" sx={styles.selectedName}>
          {customer.name}
          <CustomerSyncChip status={customer.prioritySyncStatus} />
        </Box>
        <Box component="span" sx={styles.caption}>
          <bdi>{formatCustomerTaxId(customer)}</bdi>
        </Box>
        <Box component="span" sx={styles.caption}>
          {formatCustomerContactLine(customer)}
        </Box>
      </Box>
      <Box sx={styles.actions}>
        <Box
          target="_blank"
          component={Link}
          rel="noreferrer"
          sx={styles.link}
          to={buildCustomerPath(customer.id)}
        >
          {CUSTOMER_PICKER_COPY.OPEN_CUSTOMER}
        </Box>
        <Button
          onClick={onReplace}
          variant={BUTTON_VARIANTS.NEUTRAL}
          text={CUSTOMER_PICKER_COPY.REPLACE}
        />
      </Box>
    </Box>
  );
};

export default SelectedCustomerSummary;
