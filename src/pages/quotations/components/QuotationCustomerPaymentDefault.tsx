import {
  applyCustomerPaymentDefault,
  paymentConfigurationSummary,
  configuredCustomerPaymentDefault,
} from "../../../utilities/payment-configuration.utility";

import type { FC } from "react";
import { Box } from "@mui/material";
import Button from "../../../components/Button/Button";
import InlineError from "../../../components/InlineError/InlineError";
import { useCustomerQuery } from "../../../hooks/queries/customer.query";
import type { IQuotation } from "../../../interfaces/quotation.interface";
import { getApiErrorMessage } from "../../../utilities/api-error.utility";
import { BUTTON_VARIANTS } from "../../../components/Button/constants/button.constants";
import { PAYMENT_CONFIGURATION_COPY } from "../../../constants/payment-configuration.constant";
import { useStyles } from "../../../components/PaymentConfigurationEditor/PaymentConfigurationEditor.style";

interface IQuotationCustomerPaymentDefaultProps {
  disabled: boolean;
  quotation: IQuotation;
  originalCustomerId: string;
  onChange: (quotation: IQuotation) => void;
}
const QuotationCustomerPaymentDefault: FC<IQuotationCustomerPaymentDefaultProps> = ({
  quotation,
  disabled,
  originalCustomerId,
  onChange,
}) => {
  const styles = useStyles();
  const customer = useCustomerQuery(disabled ? null : quotation.customerId);
  const loaded = customer.data?.id === quotation.customerId ? customer.data : null;
  const configuration = loaded ? configuredCustomerPaymentDefault(loaded) : null;
  const changed = originalCustomerId !== quotation.customerId;
  const ready = loaded !== null && !customer.isError && !customer.isFetching;
  const applicableConfiguration = ready ? configuration : null;
  const showNoDefault = ready && configuration === null;
  if (disabled) {
    return null;
  }

  return (
    <Box sx={styles.root}>
      <Box component="p" role="status">
        {changed
          ? PAYMENT_CONFIGURATION_COPY.CHANGED
          : PAYMENT_CONFIGURATION_COPY.DEFAULT_AVAILABLE}
      </Box>
      {customer.isFetching && <Box role="status">{PAYMENT_CONFIGURATION_COPY.LOADING}</Box>}
      {customer.isError && (
        <Box>
          <InlineError message={getApiErrorMessage(customer.error)} />
          <Button
            variant={BUTTON_VARIANTS.NEUTRAL}
            text={PAYMENT_CONFIGURATION_COPY.RETRY}
            onClick={() => customer.refetch().then(() => {})}
          />
        </Box>
      )}
      {showNoDefault && <Box component="p">{PAYMENT_CONFIGURATION_COPY.NO_DEFAULT}</Box>}
      {applicableConfiguration && (
        <Box sx={styles.row}>
          <Box component="span" sx={styles.caption}>
            {paymentConfigurationSummary(applicableConfiguration)}
          </Box>
          <Button
            variant={BUTTON_VARIANTS.NEUTRAL}
            text={PAYMENT_CONFIGURATION_COPY.APPLY}
            onClick={() => onChange(applyCustomerPaymentDefault(quotation, loaded))}
          />
          <Box component="span">{PAYMENT_CONFIGURATION_COPY.APPLY_HELP}</Box>
        </Box>
      )}
    </Box>
  );
};
export default QuotationCustomerPaymentDefault;
