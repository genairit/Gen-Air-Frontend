import {
  formatCustomerTaxId,
  formatCustomerContactLine,
} from "../../../utilities/customer.utility";

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

interface ISelectedCustomerSummaryProps {
  onReplace: () => void;
  customer: IApiCustomer;
  isHighlighted?: boolean;
}

const SelectedCustomerSummary: FC<ISelectedCustomerSummaryProps> = ({
  customer,
  onReplace,
  isHighlighted = false,
}) => {
  const styles = useStyles();
  const selectedStyle = isHighlighted ? styles.highlightedSelected : styles.selected;
  const replaceVariant = isHighlighted ? BUTTON_VARIANTS.PRIMARY : BUTTON_VARIANTS.NEUTRAL;

  return (
    <Box sx={selectedStyle}>
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
        <Button onClick={onReplace} variant={replaceVariant} text={CUSTOMER_PICKER_COPY.REPLACE} />
      </Box>
    </Box>
  );
};

export default SelectedCustomerSummary;
