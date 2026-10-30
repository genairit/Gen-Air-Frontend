import type { FC } from "react";
import { Box } from "@mui/material";
import { useStyles } from "./CustomerContacts.style";
import { CUSTOMER_CONTACT_COPY } from "../../constants/customer-contact.constant";
import type { ICustomerContact } from "../../interfaces/customer-contact.interface";

interface ICustomerContactSummaryProps {
  contacts: ICustomerContact[];
}

const CustomerContactSummary: FC<ICustomerContactSummaryProps> = ({ contacts }) => {
  const styles = useStyles();
  const isEmpty = contacts.length === 0;

  return (
    <Box sx={styles.summary}>
      <Box component="span" sx={styles.caption}>
        {CUSTOMER_CONTACT_COPY.SUMMARY_LABEL}
      </Box>
      <Box sx={styles.chips}>
        {contacts.map(contact => (
          <Box component="span" key={contact.id} sx={styles.chip}>
            <b>{contact.name}</b>
            {contact.role && (
              <Box component="span" sx={styles.caption}>
                {contact.role}
              </Box>
            )}
            <bdi>{contact.phone ?? contact.email}</bdi>
          </Box>
        ))}
        {isEmpty && (
          <Box component="span" sx={styles.caption}>
            {CUSTOMER_CONTACT_COPY.SUMMARY_EMPTY}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default CustomerContactSummary;
