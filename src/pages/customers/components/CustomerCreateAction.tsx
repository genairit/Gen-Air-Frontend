import { useState } from "react";
import Button from "../../../components/Button/Button";
import { useSessionUser } from "../../../store/session.store";
import { ICON_NAMES } from "../../../constants/icon.constant";
import { PERMISSIONS } from "../../../constants/permission.constant";
import CustomerFormPopup from "../../customer-form/CustomerFormPopup";
import { hasPermission } from "../../../utilities/permission.utility";
import { CUSTOMER_FORM_COPY } from "../../../constants/customer-form.constant";
import { BUTTON_SIZES } from "../../../components/Button/constants/button.constants";

const CustomerCreateAction = () => {
  const user = useSessionUser();
  const [isOpen, setOpen] = useState(false);

  if (
    !hasPermission(user, PERMISSIONS.CUSTOMERS_READ) ||
    !hasPermission(user, PERMISSIONS.CUSTOMERS_CREATE)
  ) {
    return null;
  }

  return (
    <>
      <Button
        icon={ICON_NAMES.ADD}
        size={BUTTON_SIZES.COMPACT}
        text={CUSTOMER_FORM_COPY.ADD}
        onClick={() => setOpen(true)}
      />
      {isOpen && <CustomerFormPopup onClose={() => setOpen(false)} />}
    </>
  );
};

export default CustomerCreateAction;
