import type { FC } from "react";
import { Box } from "@mui/material";
import styles from "../quotation.module.css";
import CheckBox from "../../../components/CheckBox/CheckBox";
import { TEXT_DIRECTIONS } from "../../../constants/direction.constant";
import { QUOTATION_STATUS } from "../../../constants/quotation.constant";
import type { IQuotation } from "../../../interfaces/quotation.interface";
import ValidationMessageText from "../../../components/ValidationMessageText/ValidationMessageText";

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
    <Box key={warning.key} dir={TEXT_DIRECTIONS.RTL} className={styles.warning}>
      <CheckBox
        disabled={disabled}
        value={warning.acknowledged}
        onChange={async checked => {
          await toggle(warning.key, checked);
        }}
        text={
          <Box component="span">
            <ValidationMessageText text={warning.text} />
            <Box component="br" />
            <Box component="b">חריג — מאושר במפורש</Box>
          </Box>
        }
      />
    </Box>
  ));
};
export default QuotationWarnings;
