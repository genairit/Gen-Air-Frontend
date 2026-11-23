import {
  paymentConfigurationSummary,
  customerPaymentConfiguration,
  getCustomerPaymentConfigurationError,
} from "../../utilities/payment-configuration.utility";

import {
  PAYMENT_CONFIGURATION_COPY,
  CUSTOMER_PAYMENT_TERMS_VALUES,
} from "../../constants/payment-configuration.constant";

import Card from "../Card/Card";
import { Box } from "@mui/material";
import Button from "../Button/Button";
import { useState, type FC } from "react";
import InlineError from "../InlineError/InlineError";
import { useSessionUser } from "../../store/session.store";
import { PERMISSIONS } from "../../constants/permission.constant";
import { hasPermission } from "../../utilities/permission.utility";
import type { IApiCustomer } from "../../interfaces/api.interface";
import { getApiErrorMessage } from "../../utilities/api-error.utility";
import type { IPaymentConfiguration } from "../../interfaces/payment-configuration.interface";
import PaymentConfigurationEditor from "../PaymentConfigurationEditor/PaymentConfigurationEditor";
import { useCustomerPaymentDefaultMutation } from "../../hooks/mutations/customer-payment-default.mutation";

interface ICustomerPaymentDefaultProps {
  customer: IApiCustomer;
}
const CustomerPaymentDefault: FC<ICustomerPaymentDefaultProps> = ({ customer }) => {
  const user = useSessionUser();
  const [configuration, setConfiguration] = useState(() => customerPaymentConfiguration(customer));
  const update = useCustomerPaymentDefaultMutation(customer.id);
  const editable = hasPermission(user, PERMISSIONS.CUSTOMERS_UPDATE);
  const disabled = !editable || update.isPending;
  const validation = getCustomerPaymentConfigurationError(configuration);
  const saveDisabled = disabled || validation !== null;
  const change = (next: IPaymentConfiguration): void => {
    update.reset();
    setConfiguration(next);
  };
  return (
    <Card>
      <Box component="h2">{PAYMENT_CONFIGURATION_COPY.DEFAULT_TITLE}</Box>
      <Box component="p">{PAYMENT_CONFIGURATION_COPY.CUSTOMER_HELP}</Box>
      {editable ? (
        <PaymentConfigurationEditor
          allowUnset
          onChange={change}
          disabled={disabled}
          value={configuration}
          termsOptions={CUSTOMER_PAYMENT_TERMS_VALUES}
          customLabel={PAYMENT_CONFIGURATION_COPY.CUSTOM}
        />
      ) : (
        <Box component="p">{paymentConfigurationSummary(customer)}</Box>
      )}
      {editable && (
        <Button
          disabled={saveDisabled}
          isLoading={update.isPending}
          text={PAYMENT_CONFIGURATION_COPY.SAVE_DEFAULT}
          onClick={() =>
            update.mutate(configuration, {
              onSuccess: saved => setConfiguration(customerPaymentConfiguration(saved)),
            })
          }
        />
      )}
      {update.isError && <InlineError message={getApiErrorMessage(update.error)} />}
      {update.isSuccess && (
        <Box component="p" role="status">
          {PAYMENT_CONFIGURATION_COPY.SAVED}
        </Box>
      )}
    </Card>
  );
};
export default CustomerPaymentDefault;
