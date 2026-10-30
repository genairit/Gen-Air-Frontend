import type { FC } from "react";
import { Box } from "@mui/material";
import Button from "../Button/Button";
import Avatar from "../Avatar/Avatar";
import { useStyles } from "./CustomerContacts.style";
import { getInitials } from "../../utilities/text.utility";
import { CUSTOMER_CONTACT_COPY } from "../../constants/customer-contact.constant";
import type { ICustomerContact } from "../../interfaces/customer-contact.interface";
import { BUTTON_SIZES, BUTTON_VARIANTS } from "../Button/constants/button.constants";

interface ICustomerContactItemProps {
  contact: ICustomerContact;
  onEdit: (() => void) | null;
}
const CustomerContactItem: FC<ICustomerContactItemProps> = ({ contact, onEdit }) => {
  const styles = useStyles();
  const phoneLinkProps = contact.phone ? { href: `tel:${contact.phone}` } : {};

  return (
    <Box sx={styles.item}>
      <Box sx={styles.identity}>
        <Avatar initials={getInitials(contact.name)} />
        <Box sx={styles.details}>
          <Box component="b" sx={styles.name}>
            {contact.name}
          </Box>
          <Box component="span" sx={styles.caption}>
            {contact.role ?? CUSTOMER_CONTACT_COPY.NO_ROLE}
          </Box>
        </Box>
      </Box>
      <Box sx={styles.communication}>
        <Box dir="ltr" component="a" sx={styles.phone} {...phoneLinkProps}>
          {contact.phone ?? "—"}
        </Box>
        <Box dir="ltr" component="span" sx={styles.email}>
          {contact.email ?? "—"}
        </Box>
      </Box>
      {onEdit && (
        <Button
          onClick={onEdit}
          size={BUTTON_SIZES.COMPACT}
          text={CUSTOMER_CONTACT_COPY.EDIT}
          variant={BUTTON_VARIANTS.NEUTRAL}
        />
      )}
    </Box>
  );
};
export default CustomerContactItem;
