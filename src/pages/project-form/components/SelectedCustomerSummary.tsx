import type { FC } from "react";
import { Box } from "@mui/material";
import { Link } from "react-router-dom";
import Button from "../../../components/Button/Button";
import { useStyles } from "./ProjectCustomerPicker.style";
import { useSessionUser } from "../../../store/session.store";
import { PERMISSIONS } from "../../../constants/permission.constant";
import { buildCustomerPath } from "../../../utilities/route.utility";
import { hasPermission } from "../../../utilities/permission.utility";
import type { IApiCustomer } from "../../../interfaces/api.interface";
import { formatCustomerTaxId } from "../../../utilities/customer.utility";
import { CUSTOMER_PICKER_COPY } from "../../../constants/customer.constant";
import CustomerSyncChip from "../../../components/CustomerSyncChip/CustomerSyncChip";
import { BUTTON_VARIANTS } from "../../../components/Button/constants/button.constants";
import CustomerContactSummary from "../../../components/CustomerContacts/CustomerContactSummary";

interface ISelectedCustomerSummaryProps {
  onReplace: () => void;
  customer: IApiCustomer;
  isHighlighted?: boolean;
}

const SelectedCustomerSummary: FC<ISelectedCustomerSummaryProps> = ({
  customer,
  onReplace,
  isHighlighted = true,
}) => {
  const styles = useStyles();
  const user = useSessionUser();
  const canReadContacts = hasPermission(user, PERMISSIONS.CUSTOMERS_READ);
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
        {canReadContacts && <CustomerContactSummary contacts={customer.contacts ?? []} />}
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
