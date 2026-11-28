import {
  quotationPaymentLabel,
  quotationHasPaymentConflict,
} from "../../../utilities/quotation-payment.utility";

import type { FC } from "react";
import { Box } from "@mui/material";
import Button from "./QuotationButton";
import styles from "../quotation.module.css";
import Card from "../../../components/Card/Card";
import QuotationWarnings from "./QuotationWarnings";
import QuotationDecimalInput from "./QuotationDecimalInput";
import { quotationMoney } from "../../../utilities/quotation.utility";
import { QUOTATION_STATUS } from "../../../constants/quotation.constant";
import { QUOTATION_LIFECYCLE_BUTTON_SX } from "../../../constants/quotation.constant";
import { BUTTON_VARIANTS } from "../../../components/Button/constants/button.constants";
import { quotationDecimalInput } from "../../../utilities/quotation-presentation.utility";
import type { IQuotation, TQuotationStatus } from "../../../interfaces/quotation.interface";

interface IQuotationSummaryProps {
  blocked: boolean;
  disabled: boolean;
  canApprove: boolean;
  quotation: IQuotation;
  canResubmit?: boolean;
  showWarnings?: boolean;
  onReturn?: (() => void) | null;
  onReject?: (() => void) | null;
  onResubmit?: () => Promise<void>;
  onChange: (quotation: IQuotation) => void;
  onAcknowledge: (keys: string[]) => Promise<void>;
  onTransition: (status: TQuotationStatus) => Promise<void>;
}
const QuotationSummary: FC<IQuotationSummaryProps> = ({
  quotation,
  disabled,
  canApprove,
  blocked,
  showWarnings = true,
  canResubmit = false,
  onResubmit,
  onReject,
  onReturn,
  onChange,
  onTransition,
  onAcknowledge,
}: IQuotationSummaryProps) => {
  const totals = quotation.totals;
  const openWarnings = quotation.warnings.filter(warning => !warning.acknowledged);
  const isDraft = quotation.status === QUOTATION_STATUS.DRAFT;
  const isReview = quotation.status === QUOTATION_STATUS.REVIEW;
  const isApproved = quotation.status === QUOTATION_STATUS.APPROVED;
  const isCancelled = quotation.status === QUOTATION_STATUS.CANCELLED;
  const showApprovedReturn = isApproved && onReturn != null;
  const amounts = [
    { label: "סכום השורות", value: totals.subtotal },
    { label: "הנחה / התאמה ליעד", value: totals.discount },
    { label: "מחיר כולל לפני מע״מ", value: totals.pretax },
    { label: `מע״מ ${quotationDecimalInput(quotation.vatRate)}%`, value: totals.vat },
  ];
  return (
    <Box component="div" className={styles.summary}>
      <Card>
        {amounts.map(amount => (
          <Box component="div" key={amount.label} className={styles.between}>
            <Box component="span">{amount.label}</Box>
            <Box component="b">{quotationMoney(amount.value)}</Box>
          </Box>
        ))}
        <Box component="div" className={styles.between}>
          <Box component="b">סה״כ כולל מע״מ</Box>
          <Box component="span" className={styles.total}>
            {quotationMoney(totals.total)}
          </Box>
        </Box>
        <QuotationDecimalInput
          min="0"
          step="0.01"
          type="number"
          disabled={disabled}
          label="סכום סופי לפני מע״מ (יעד)"
          value={quotation.targetPretaxAmount ?? ""}
          onChange={event =>
            onChange({ ...quotation, targetPretaxAmount: event.target.value || null })
          }
        />
        <Box component="span" className={styles.muted}>
          סכום היעד גובר על אחוז ההנחה.
        </Box>
      </Card>
      <Card>
        <Box component="h2" className={styles.heading}>
          בדיקה ואישור
        </Box>
        <Box component="p" className={styles.muted}>
          {openWarnings.length > 0 ? `${openWarnings.length} התראות פתוחות` : "אין התראות פתוחות"}
        </Box>
        {quotationHasPaymentConflict(quotation) && (
          <Box role="alert" className={styles.error}>
            {quotationPaymentLabel(quotation)}
          </Box>
        )}
        {blocked && (
          <Box component="p" role="status">
            יש להמתין לשמירה מוצלחת לפני בדיקה ואישור.
          </Box>
        )}
        {showWarnings && (
          <QuotationWarnings
            blocked={blocked}
            quotation={quotation}
            canApprove={canApprove}
            onAcknowledge={onAcknowledge}
          />
        )}
        {canResubmit && onResubmit && (
          <Button disabled={blocked} onClick={onResubmit} text="שליחה מחדש לבדיקה" />
        )}
        {canApprove && !isCancelled && (
          <Box component="div" className={styles.stack}>
            {isDraft && !canResubmit && (
              <Button
                disabled={blocked}
                text="סיימתי, לבדיקה"
                onClick={() => onTransition(QUOTATION_STATUS.REVIEW)}
              />
            )}{" "}
            {isReview && (
              <>
                <Button
                  text="אישור ההצעה"
                  disabled={blocked || openWarnings.length > 0}
                  onClick={() => onTransition(QUOTATION_STATUS.APPROVED)}
                />
                {onReturn && (
                  <Button
                    disabled={blocked}
                    onClick={onReturn}
                    text="החזרה לעריכה"
                    variant={BUTTON_VARIANTS.NEUTRAL}
                    sx={QUOTATION_LIFECYCLE_BUTTON_SX}
                  />
                )}
                {onReject && (
                  <Button
                    disabled={blocked}
                    onClick={onReject}
                    text="דחייה עם סיבה"
                    variant={BUTTON_VARIANTS.DANGER}
                    sx={QUOTATION_LIFECYCLE_BUTTON_SX}
                  />
                )}
              </>
            )}
            {showApprovedReturn && (
              <Button
                disabled={blocked}
                onClick={onReturn}
                text="החזרה לעריכה"
                variant={BUTTON_VARIANTS.NEUTRAL}
                sx={QUOTATION_LIFECYCLE_BUTTON_SX}
              />
            )}
          </Box>
        )}
      </Card>
    </Box>
  );
};
export default QuotationSummary;
