import type { FC } from "react";
import Button from "../Button/Button";
import InlineError from "../InlineError/InlineError";
import { useSessionUser } from "../../store/session.store";
import CustomerContactSummary from "./CustomerContactSummary";
import { PERMISSIONS } from "../../constants/permission.constant";
import { hasPermission } from "../../utilities/permission.utility";
import { CUSTOMER_CONTACT_COPY } from "../../constants/customer-contact.constant";
import { BUTTON_SIZES, BUTTON_VARIANTS } from "../Button/constants/button.constants";
import { useCustomerContactsQuery } from "../../hooks/queries/customer-contact.query";
import { getCustomerImportErrorMessage } from "../../utilities/customer-import-error.utility";

interface ICustomerContactPreviewProps {
  customerId: string;
}

const CustomerContactPreview: FC<ICustomerContactPreviewProps> = ({ customerId }) => {
  const user = useSessionUser();
  const canRead = hasPermission(user, PERMISSIONS.CUSTOMERS_READ);
  const query = useCustomerContactsQuery(customerId, canRead);

  if (!canRead) {
    return null;
  }

  if (query.isPending) {
    return <span role="status">{CUSTOMER_CONTACT_COPY.LOADING}</span>;
  }

  if (query.isError) {
    return (
      <>
        <InlineError message={getCustomerImportErrorMessage(query.error)} />
        <Button
          size={BUTTON_SIZES.COMPACT}
          variant={BUTTON_VARIANTS.NEUTRAL}
          text={CUSTOMER_CONTACT_COPY.RETRY}
          onClick={async () => {
            await query.refetch();
          }}
        />
      </>
    );
  }

  return <CustomerContactSummary contacts={query.data} />;
};

export default CustomerContactPreview;
