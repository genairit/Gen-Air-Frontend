import {
  PAYMENT_TERMS_VALUES,
  PAYMENT_TERMS_LABELS,
  CUSTOMER_PAYMENT_DEFAULT_COPY,
  CUSTOMER_PAYMENT_DEFAULT_LABELS,
} from "../../constants/payment-terms.constant";

import type { FC } from "react";
import Card from "../Card/Card";
import { useState } from "react";
import Button from "../Button/Button";
import InlineError from "../InlineError/InlineError";
import Autocomplete from "../Autocomplete/Autocomplete";
import { useSessionUser } from "../../store/session.store";
import { PERMISSIONS } from "../../constants/permission.constant";
import { isPaymentTerms } from "../../utilities/guards/api.guard";
import { hasPermission } from "../../utilities/permission.utility";
import type { IApiCustomer } from "../../interfaces/api.interface";
import { getApiErrorMessage } from "../../utilities/api-error.utility";
import { useCustomerPaymentDefaultMutation } from "../../hooks/mutations/customer-payment-default.mutation";

interface ICustomerPaymentDefaultProps {
  customer: IApiCustomer;
}
const CustomerPaymentDefault: FC<ICustomerPaymentDefaultProps> = ({
  customer,
}: ICustomerPaymentDefaultProps) => {
  const user = useSessionUser();
  const [selected, setSelected] = useState(customer.paymentTerms ?? null);
  const update = useCustomerPaymentDefaultMutation(customer.id);
  const editable = hasPermission(user, PERMISSIONS.CUSTOMERS_UPDATE);
  const label = selected
    ? PAYMENT_TERMS_LABELS[selected].title
    : CUSTOMER_PAYMENT_DEFAULT_COPY.NONE;
  const options = CUSTOMER_PAYMENT_DEFAULT_LABELS;
  const change = (label: string | null) => {
    const key =
      PAYMENT_TERMS_VALUES.find(value => PAYMENT_TERMS_LABELS[value].title === label) ?? null;
    if (key === null || isPaymentTerms(key)) {
      setSelected(key);
    }
  };
  return (
    <Card>
      <h2>תנאי תשלום כברירת מחדל</h2>
      <p>יועתקו להצעות מחיר חדשות בלבד. הערות לתשלום נשמרות בהצעה עצמה.</p>
      <Autocomplete
        value={label}
        options={options}
        onChange={change}
        title="תנאי תשלום"
        isAutocomplete={false}
        disabled={!editable || update.isPending}
      />
      {editable && (
        <Button
          text="שמירת ברירת מחדל"
          isLoading={update.isPending}
          onClick={() => update.mutate(selected)}
        />
      )}{" "}
      {update.isError && <InlineError message={getApiErrorMessage(update.error)} />}
      {update.isSuccess && <p role="status">ברירת המחדל נשמרה</p>}
    </Card>
  );
};
export default CustomerPaymentDefault;
