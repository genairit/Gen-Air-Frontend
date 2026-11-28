import type { FC } from "react";
import { Box } from "@mui/material";
import Card from "../../../components/Card/Card";
import { usePageStyles } from "../../page.style";
import Button from "../../../components/Button/Button";
import { ICON_NAMES } from "../../../constants/icon.constant";
import DetailTile from "../../../components/DetailTile/DetailTile";
import CardHeader from "../../../components/CardHeader/CardHeader";
import { toTelephoneHref } from "../../../utilities/phone.utility";
import type { IApiCustomer } from "../../../interfaces/api.interface";
import { BUTTON_VARIANTS } from "../../../components/Button/constants/button.constants";
import { CUSTOMER_OWN_CONTACT_COPY } from "../../../constants/customer-own-contact.constant";

interface ICustomerPrimaryContactCardProps {
  customer: IApiCustomer;
  onEdit: (() => void) | null;
}

const CustomerPrimaryContactCard: FC<ICustomerPrimaryContactCardProps> = ({ customer, onEdit }) => {
  const styles = usePageStyles();
  const primary = customer.primaryContact;
  const phone = primary?.phone ?? null;
  const email = primary?.email ?? null;
  const phoneHref = phone ? toTelephoneHref(phone) : null;
  const emailHref = email ? `mailto:${email}` : null;
  const phoneValue = phone ?? CUSTOMER_OWN_CONTACT_COPY.EMPTY_PHONE;
  const emailValue = email ?? CUSTOMER_OWN_CONTACT_COPY.EMPTY_EMAIL;
  return (
    <Card gap="18px" padding="24px">
      <CardHeader
        icon={ICON_NAMES.CONTACTS}
        title={CUSTOMER_OWN_CONTACT_COPY.TITLE}
        subtitle={CUSTOMER_OWN_CONTACT_COPY.SUBTITLE}
      />
      <Box sx={styles.grid({ minColumnWidth: 240, gap: "16px" })}>
        <DetailTile
          isLtr
          href={phoneHref}
          value={phoneValue}
          label={CUSTOMER_OWN_CONTACT_COPY.PHONE_LABEL}
        />
        <DetailTile
          isLtr
          href={emailHref}
          value={emailValue}
          label={CUSTOMER_OWN_CONTACT_COPY.EMAIL_LABEL}
        />
      </Box>
      {onEdit && (
        <Box sx={styles.row({ gap: "8px" })}>
          <Button
            onClick={onEdit}
            variant={BUTTON_VARIANTS.NEUTRAL}
            text={CUSTOMER_OWN_CONTACT_COPY.EDIT}
          />
        </Box>
      )}
    </Card>
  );
};

export default CustomerPrimaryContactCard;
