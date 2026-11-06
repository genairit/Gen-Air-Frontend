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
      <div className={styles.cardTitle}>
        <span aria-hidden="true" className={styles.cardIcon}>
          <Icon name={ICON_NAMES.PAYMENT} />
        </span>
        <div>
          <h2>תנאי תשלום</h2>
          <p className={styles.muted}>
            ברירת המחדל הועתקה מהלקוח. אפשר לבחור תנאים קבועים או לפרט שלבי תשלום להצעה זו בלבד
          </p>
        </div>
      </div>
      <div role="radiogroup" aria-label="תנאי תשלום" className={styles.paymentChips}>
        {PAYMENT_TERMS_VALUES.map(value => (
          <button
            key={value}
            role="radio"
            type="button"
            disabled={disabled}
            onClick={() => chooseFixedTerm(value)}
            aria-checked={!schedule.length && quotation.paymentTerms === value}
          >
            {PAYMENT_TERMS_LABELS[value].title}
          </button>
        ))}
        <button
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
        </button>
      </div>
      {hasConflict && (
        <p role="alert" className={styles.error}>
          נבחרו גם תנאי תשלום קבועים וגם שלבים. בחרו {PAYMENT_STAGES_LABEL}, או בחרו תנאי תשלום
          קבועים והסירו את השלבים.
        </p>
      )}
      {pendingTerms !== null && (
        <div className={styles.error}>
          בחירת תנאי תשלום קבועים תמחק את שלבי התשלום שהוזנו בהצעה זו.
          <div className={styles.row}>
            <Button disabled={disabled} onClick={confirmFixedTerm} text="מחק שלבים ובחר תנאים" />
            <Button text="ביטול" onClick={() => setPendingTerms(null)} />
          </div>
        </div>
      )}
      {rows.map((stage, index) => (
        <div key={index} className={styles.paymentStage}>
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
          <span className={styles.stageAmount}>{stage.amount}</span>
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
        </div>
      ))}
      <div className={styles.row}>
        <span className={styles.muted}>סה״כ {scheduleTotal}%</span>
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
      </div>
      {schedule.length > 0 && hasIncompleteStages && (
        <p role="status" className={styles.muted}>
          כדי לאשר את ההצעה, תארו כל שלב והשלימו את האחוזים ל־100%.
        </p>
      )}
      {!schedule.length && quotation.paymentTerms === null && (
        <p role="status" className={styles.muted}>
          בחרו תנאי תשלום או הוסיפו שלב תשלום.
        </p>
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
