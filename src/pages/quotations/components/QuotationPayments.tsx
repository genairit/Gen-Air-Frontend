import { Box } from "@mui/material";
import type { FC, ReactNode } from "react";
import styles from "../quotation.module.css";
import QuotationInput from "./QuotationInput";
import Card from "../../../components/Card/Card";
import Icon from "../../../components/Icon/Icon";
import { ICON_NAMES } from "../../../constants/icon.constant";
import type { IQuotation } from "../../../interfaces/quotation.interface";
import { quotationPaymentRows } from "../../../utilities/quotation-presentation.utility";
import { quotationPaymentConfiguration } from "../../../utilities/quotation-payment.utility";
import { PAYMENT_CONFIGURATION_COPY } from "../../../constants/payment-configuration.constant";
import PaymentConfigurationEditor from "../../../components/PaymentConfigurationEditor/PaymentConfigurationEditor";

interface IQuotationPaymentsProps {
  disabled: boolean;
  quotation: IQuotation;
  customerDefault?: ReactNode;
  onChange: (quotation: IQuotation) => void;
}
const QuotationPayments: FC<IQuotationPaymentsProps> = ({
  quotation,
  disabled,
  onChange,
  customerDefault,
}) => {
  const amounts = quotationPaymentRows(quotation).map(stage => stage.amount);
  const isUnset = quotation.paymentSchedule.length === 0 && quotation.paymentTerms === null;
  return (
    <Card>
      <Box component="div" className={styles.cardTitle}>
        <Box component="span" aria-hidden="true" className={styles.cardIcon}>
          <Icon name={ICON_NAMES.PAYMENT} />
        </Box>
        <Box component="div">
          <Box component="h2">תנאי תשלום</Box>
          <Box component="p" className={styles.muted}>
            {PAYMENT_CONFIGURATION_COPY.QUOTE_HELP}
          </Box>
        </Box>
      </Box>
      {customerDefault}
      <PaymentConfigurationEditor
        amounts={amounts}
        disabled={disabled}
        value={quotationPaymentConfiguration(quotation)}
        onChange={configuration => onChange({ ...quotation, ...configuration })}
      />
      {isUnset && (
        <Box component="p" role="status" className={styles.muted}>
          בחרו תנאי תשלום או הוסיפו שלב תשלום.
        </Box>
      )}
      <QuotationInput
        maxLength={1000}
        disabled={disabled}
        placeholder="ריק כברירת מחדל"
        value={quotation.paymentTermsNote}
        caption="הערת תנאי תשלום (בהצעה זו בלבד)"
        label="הערה לתנאי התשלום (להצעה זו בלבד)"
        onChange={event => onChange({ ...quotation, paymentTermsNote: event.target.value })}
      />
    </Card>
  );
};
export default QuotationPayments;
