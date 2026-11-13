import {
  PAYMENT_TERMS_VALUES,
  PAYMENT_TERMS_LABELS,
  PAYMENT_STAGES_LABEL,
  type PaymentTermsType,
} from "../../../constants/payment-terms.constant";

import {
  quotationUsesPaymentStages,
  selectQuotationPaymentTerm,
  quotationHasPaymentConflict,
  selectQuotationPaymentStages,
  changeQuotationPaymentSchedule,
} from "../../../utilities/quotation-payment.utility";

import {
  quotationPaymentRows,
  quotationPaymentTotal,
} from "../../../utilities/quotation-presentation.utility";

import {
  BUTTON_SIZES,
  BUTTON_SHAPES,
  BUTTON_VARIANTS,
} from "../../../components/Button/constants/button.constants";

import Button from "./QuotationButton";
import { useState, type FC } from "react";
import styles from "../quotation.module.css";
import QuotationInput from "./QuotationInput";
import { Box, ButtonBase } from "@mui/material";
import Icon from "../../../components/Icon/Icon";
import Card from "../../../components/Card/Card";
import QuotationDecimalInput from "./QuotationDecimalInput";
import { ICON_NAMES } from "../../../constants/icon.constant";
import type { IQuotation } from "../../../interfaces/quotation.interface";

interface IQuotationPaymentsProps {
  disabled: boolean;
  quotation: IQuotation;
  onChange: (quotation: IQuotation) => void;
}
const QuotationPayments: FC<IQuotationPaymentsProps> = ({
  quotation,
  disabled,
  onChange,
}: IQuotationPaymentsProps) => {
  const [pendingTerms, setPendingTerms] = useState<PaymentTermsType | null>(null);
  const schedule = quotation.paymentSchedule;
  const rows = quotationPaymentRows(quotation);
  const scheduleTotal = quotationPaymentTotal(quotation);
  const hasConflict = quotationHasPaymentConflict(quotation);
  const hasIncompleteStages = schedule.some(stage => !stage.text.trim()) || scheduleTotal !== "100";
  const chooseFixedTerm = (paymentTerms: PaymentTermsType): void => {
    if (schedule.length) {
      setPendingTerms(paymentTerms);
      return;
    }
    onChange(selectQuotationPaymentTerm(quotation, paymentTerms));
  };
  const confirmFixedTerm = (): void => {
    if (pendingTerms === null) {
      return;
    }
    onChange(selectQuotationPaymentTerm(quotation, pendingTerms));
    setPendingTerms(null);
  };
  return (
    <Card>
      <Box component="div" className={styles.cardTitle}>
        <Box component="span" aria-hidden="true" className={styles.cardIcon}>
          <Icon name={ICON_NAMES.PAYMENT} />
        </Box>
        <Box component="div">
          <Box component="h2">תנאי תשלום</Box>
          <Box component="p" className={styles.muted}>
            ברירת המחדל הועתקה מהלקוח. אפשר לבחור תנאים קבועים או לפרט שלבי תשלום להצעה זו בלבד
          </Box>
        </Box>
      </Box>
      <Box
        component="div"
        role="radiogroup"
        aria-label="תנאי תשלום"
        className={styles.paymentChips}
      >
        {PAYMENT_TERMS_VALUES.map(value => (
          <ButtonBase
            key={value}
            role="radio"
            type="button"
            disabled={disabled}
            onClick={() => chooseFixedTerm(value)}
            aria-checked={!schedule.length && quotation.paymentTerms === value}
          >
            {PAYMENT_TERMS_LABELS[value].title}
          </ButtonBase>
        ))}
        <ButtonBase
          role="radio"
          type="button"
          disabled={disabled}
          aria-checked={quotationUsesPaymentStages(quotation)}
          onClick={() => {
            setPendingTerms(null);
            onChange(selectQuotationPaymentStages(quotation));
          }}
        >
          {PAYMENT_STAGES_LABEL}
        </ButtonBase>
      </Box>
      {hasConflict && (
        <Box role="alert" component="p" className={styles.error}>
          נבחרו גם תנאי תשלום קבועים וגם שלבים. בחרו {PAYMENT_STAGES_LABEL}, או בחרו תנאי תשלום
          קבועים והסירו את השלבים.
        </Box>
      )}
      {pendingTerms !== null && (
        <Box component="div" className={styles.error}>
          בחירת תנאי תשלום קבועים תמחק את שלבי התשלום שהוזנו בהצעה זו.
          <Box component="div" className={styles.row}>
            <Button disabled={disabled} onClick={confirmFixedTerm} text="מחק שלבים ובחר תנאים" />
            <Button text="ביטול" onClick={() => setPendingTerms(null)} />
          </Box>
        </Box>
      )}
      {rows.map((stage, index) => (
        <Box key={index} component="div" className={styles.paymentStage}>
          <QuotationDecimalInput
            min="0"
            max="100"
            step="0.01"
            type="number"
            label="אחוז מהסכום"
            disabled={disabled}
            value={stage.percent}
            onChange={event =>
              onChange(
                changeQuotationPaymentSchedule(
                  quotation,
                  schedule.map((current, currentIndex) =>
                    currentIndex === index ? { ...current, percent: event.target.value } : current,
                  ),
                ),
              )
            }
          />
          <QuotationInput
            maxLength={300}
            value={stage.text}
            disabled={disabled}
            label="מועד / אבן דרך"
            onChange={event =>
              onChange(
                changeQuotationPaymentSchedule(
                  quotation,
                  schedule.map((current, currentIndex) =>
                    currentIndex === index ? { ...current, text: event.target.value } : current,
                  ),
                ),
              )
            }
          />
          <Box component="span" className={styles.stageAmount}>
            {stage.amount}
          </Box>
          {!disabled && (
            <Button
              text="×"
              ariaLabel="הסר שלב"
              size={BUTTON_SIZES.COMPACT}
              shape={BUTTON_SHAPES.CIRCLE}
              variant={BUTTON_VARIANTS.NEUTRAL}
              onClick={() =>
                onChange(
                  changeQuotationPaymentSchedule(
                    quotation,
                    schedule.filter((_stage, currentIndex) => currentIndex !== index),
                  ),
                )
              }
            />
          )}
        </Box>
      ))}
      <Box component="div" className={styles.row}>
        <Box component="span" className={styles.muted}>
          סה״כ {scheduleTotal}%
        </Box>
        {!disabled && (
          <Button
            text="+ שלב תשלום"
            ariaLabel="הוסף שלב תשלום"
            size={BUTTON_SIZES.COMPACT}
            variant={BUTTON_VARIANTS.NEUTRAL}
            onClick={() =>
              onChange(
                changeQuotationPaymentSchedule(quotation, [
                  ...schedule,
                  { percent: "0", text: "" },
                ]),
              )
            }
          />
        )}
      </Box>
      {schedule.length > 0 && hasIncompleteStages && (
        <Box component="p" role="status" className={styles.muted}>
          כדי לאשר את ההצעה, תארו כל שלב והשלימו את האחוזים ל־100%.
        </Box>
      )}
      {!schedule.length && quotation.paymentTerms === null && (
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
