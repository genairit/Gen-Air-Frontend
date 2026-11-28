import Button from "../Button/Button";
import { ICON_NAMES } from "../../constants/icon.constant";
import type { IApiCustomer } from "../../interfaces/api.interface";
import { CUSTOMER_FORM_COPY } from "../../constants/customer-form.constant";
import { BUTTON_SHAPES, BUTTON_SIZES, BUTTON_VARIANTS } from "../Button/constants/button.constants";

interface ICustomerEditButtonProps {
  customer: IApiCustomer;
  onEdit: (customer: IApiCustomer) => void;
}

const CustomerEditButton = ({ customer, onEdit }: ICustomerEditButtonProps) => (
  <Button
    icon={ICON_NAMES.EDIT}
    size={BUTTON_SIZES.COMPACT}
    shape={BUTTON_SHAPES.CIRCLE}
    variant={BUTTON_VARIANTS.NEUTRAL}
    ariaLabel={`${CUSTOMER_FORM_COPY.EDIT} · ${customer.name}`}
    onClick={event => {
      event.stopPropagation();
      onEdit(customer);
    }}
  />
);

export default CustomerEditButton;
