import Button from "../../../components/Button/Button";
import { useSessionUser } from "../../../store/session.store";
import { ICON_NAMES } from "../../../constants/icon.constant";
import { PERMISSIONS } from "../../../constants/permission.constant";
import { hasPermission } from "../../../utilities/permission.utility";
import { CUSTOMER_FORM_COPY } from "../../../constants/customer-form.constant";
import { BUTTON_SIZES } from "../../../components/Button/constants/button.constants";

const CustomerCreateAction = ({ onClick }: { onClick: () => void }) => {
  const user = useSessionUser();

  if (
    !hasPermission(user, PERMISSIONS.CUSTOMERS_READ) ||
    !hasPermission(user, PERMISSIONS.CUSTOMERS_CREATE)
  ) {
    return null;
  }

  return (
    <Button
      onClick={onClick}
      icon={ICON_NAMES.ADD}
      size={BUTTON_SIZES.COMPACT}
      text={CUSTOMER_FORM_COPY.ADD}
    />
  );
};

export default CustomerCreateAction;
