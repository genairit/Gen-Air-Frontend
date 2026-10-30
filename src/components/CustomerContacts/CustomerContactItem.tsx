import {
  CUSTOMER_CONTACT_COPY,
  CUSTOMER_CONTACT_FIELDS,
} from "../../constants/customer-contact.constant";

import type { FC } from "react";
import { Box } from "@mui/material";
import Button from "../Button/Button";
import DetailTile from "../DetailTile/DetailTile";
import { usePageStyles } from "../../pages/page.style";
import { BUTTON_VARIANTS } from "../Button/constants/button.constants";
import type { ICustomerContact } from "../../interfaces/customer-contact.interface";
import { formatCustomerDetailValue } from "../../utilities/customer-details.utility";

interface ICustomerContactItemProps {
  contact: ICustomerContact;
  onEdit: (() => void) | null;
}
const CustomerContactItem: FC<ICustomerContactItemProps> = ({ contact, onEdit }) => {
  const styles = usePageStyles();
  const fields = CUSTOMER_CONTACT_FIELDS.map(field => ({
    ...field,
    value: formatCustomerDetailValue(contact[field.field]),
  }));
  return (
    <Box sx={styles.stack({})}>
      <Box sx={styles.grid({ minColumnWidth: 160, gap: "14px" })}>
        {fields.map(field => (
          <DetailTile
            key={field.field}
            label={field.label}
            isLtr={field.isLtr}
            value={field.value}
          />
        ))}
      </Box>
      {onEdit && (
        <Button
          onClick={onEdit}
          text={CUSTOMER_CONTACT_COPY.EDIT}
          variant={BUTTON_VARIANTS.NEUTRAL}
        />
      )}
    </Box>
  );
};
export default CustomerContactItem;
