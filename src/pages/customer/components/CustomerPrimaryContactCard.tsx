import {
  toCustomerOwnContactDraft,
  toCustomerOwnContactInput,
  getCustomerOwnContactErrors,
} from "../../../utilities/customer-own-contact.utility";

import { Box } from "@mui/material";
import { type FC, useState } from "react";
import Card from "../../../components/Card/Card";
import { usePageStyles } from "../../page.style";
import Button from "../../../components/Button/Button";
import { ICON_NAMES } from "../../../constants/icon.constant";
import { useSessionUser } from "../../../store/session.store";
import CustomerOwnContactEditor from "./CustomerOwnContactEditor";
import DetailTile from "../../../components/DetailTile/DetailTile";
import CardHeader from "../../../components/CardHeader/CardHeader";
import { toTelephoneHref } from "../../../utilities/phone.utility";
import { PERMISSIONS } from "../../../constants/permission.constant";
import { hasPermission } from "../../../utilities/permission.utility";
import type { IApiCustomer } from "../../../interfaces/api.interface";
import { getApiErrorMessage } from "../../../utilities/api-error.utility";
import { BUTTON_VARIANTS } from "../../../components/Button/constants/button.constants";
import { CUSTOMER_OWN_CONTACT_COPY } from "../../../constants/customer-own-contact.constant";
import { useUpdateCustomerOwnContactMutation } from "../../../hooks/mutations/customer.mutation";

interface ICustomerPrimaryContactCardProps {
  customer: IApiCustomer;
}

const CustomerPrimaryContactCard: FC<ICustomerPrimaryContactCardProps> = ({ customer }) => {
  const styles = usePageStyles();
  const user = useSessionUser();
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(toCustomerOwnContactDraft(customer.primaryContact ?? null));
  const update = useUpdateCustomerOwnContactMutation(customer.id);
  const canEdit = hasPermission(user, PERMISSIONS.CUSTOMERS_UPDATE);
  const showEditor = canEdit && isEditing;
  const primary = customer.primaryContact;
  const phone = primary?.phone ?? null;
  const email = primary?.email ?? null;
  const phoneHref = phone ? toTelephoneHref(phone) : null;
  const emailHref = email ? `mailto:${email}` : null;
  const phoneValue = phone ?? CUSTOMER_OWN_CONTACT_COPY.EMPTY_PHONE;
  const emailValue = email ?? CUSTOMER_OWN_CONTACT_COPY.EMPTY_EMAIL;
  const error = update.isError ? getApiErrorMessage(update.error) : null;

  const beginEditing = () => {
    update.reset();
    setDraft(toCustomerOwnContactDraft(customer.primaryContact ?? null));
    setIsEditing(true);
  };

  const save = () => {
    if (
      !canEdit ||
      update.isPending ||
      Object.keys(getCustomerOwnContactErrors(draft)).length > 0
    ) {
      return;
    }

    update.mutate(toCustomerOwnContactInput(draft), { onSuccess: () => setIsEditing(false) });
  };

  return (
    <Card gap="18px" padding="24px">
      <CardHeader
        icon={ICON_NAMES.CONTACTS}
        title={CUSTOMER_OWN_CONTACT_COPY.TITLE}
        subtitle={CUSTOMER_OWN_CONTACT_COPY.SUBTITLE}
      />
      {showEditor ? (
        <CustomerOwnContactEditor
          draft={draft}
          error={error}
          onSave={save}
          onChange={setDraft}
          busy={update.isPending}
          onCancel={() => setIsEditing(false)}
        />
      ) : (
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
      )}
      {canEdit && !isEditing && (
        <Box sx={styles.row({ gap: "8px" })}>
          <Button
            onClick={beginEditing}
            variant={BUTTON_VARIANTS.NEUTRAL}
            text={CUSTOMER_OWN_CONTACT_COPY.EDIT}
          />
        </Box>
      )}
    </Card>
  );
};

export default CustomerPrimaryContactCard;
