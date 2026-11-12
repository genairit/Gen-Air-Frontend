import type { FC } from "react";
import styles from "../quotation.module.css";
import { Box, Checkbox } from "@mui/material";
import { QUOTATION_STATUS } from "../../../constants/quotation.constant";
import type { IQuotation } from "../../../interfaces/quotation.interface";

interface IQuotationWarningsProps {
  blocked: boolean;
  canApprove: boolean;
  quotation: IQuotation;
  onAcknowledge: (keys: string[]) => Promise<void>;
}
const QuotationWarnings: FC<IQuotationWarningsProps> = ({
  blocked,
  quotation,
  canApprove,
  onAcknowledge,
}) => {
  const acknowledged = quotation.warnings
    .filter(warning => warning.acknowledged)
    .map(warning => warning.key);
  const disabled =
    !canApprove ||
    blocked ||
    quotation.status === QUOTATION_STATUS.APPROVED ||
    quotation.status === QUOTATION_STATUS.CANCELLED;
  const toggle = (key: string, checked: boolean) =>
    onAcknowledge(
      checked ? [...acknowledged, key] : acknowledged.filter(current => current !== key),
    );
  return quotation.warnings.map(warning => (
    <Box component="label" key={warning.key} className={styles.warning}>
      <Checkbox
        disabled={disabled}
        checked={warning.acknowledged}
        onChange={event => toggle(warning.key, event.target.checked)}
      />
      <Box component="span">
        {warning.text}
        <Box component="br" />
        <Box component="b">חריג — מאושר במפורש</Box>
      </Box>
    </Box>
  ));
};
export default QuotationWarnings;
