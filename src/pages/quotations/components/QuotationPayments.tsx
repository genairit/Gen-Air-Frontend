import {
  PAYMENT_TERMS_VALUES,
  PAYMENT_TERMS_LABELS,
} from "../../../constants/payment-terms.constant";

import {
  quotationPaymentRows,
  quotationPaymentTotal,
} from "../../../utilities/quotation-presentation.utility";

import {
  BUTTON_SIZES,
  BUTTON_SHAPES,
  BUTTON_VARIANTS,
} from "../../../components/Button/constants/button.constants";

import type { FC } from "react";
import styles from "../quotation.module.css";
import QuotationInput from "./QuotationInput";
import Icon from "../../../components/Icon/Icon";
import Card from "../../../components/Card/Card";
import Button from "../../../components/Button/Button";
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
  const schedule = quotation.paymentSchedule;
  const rows = quotationPaymentRows(quotation);
  const scheduleTotal = quotationPaymentTotal(quotation);
  return (
    <Card>
      <div className={styles.cardTitle}>
        <span aria-hidden="true" className={styles.cardIcon}>
          <Icon name={ICON_NAMES.PAYMENT} />
        </span>
        <div>
          <h2>תנאי תשלום</h2>
          <p className={styles.muted}>
            הועתקו מהלקוח ביצירת ההצעה. אפשר לערוך אותם כאן בלי לשנות את הלקוח
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
            aria-checked={quotation.paymentTerms === value}
            onClick={() => onChange({ ...quotation, paymentTerms: value })}
          >
            {PAYMENT_TERMS_LABELS[value].title}
          </button>
        ))}
      </div>
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
              onChange({
                ...quotation,
                paymentSchedule: schedule.map((current, currentIndex) =>
                  currentIndex === index ? { ...current, percent: event.target.value } : current,
                ),
              })
            }
          />
          <QuotationInput
            maxLength={300}
            value={stage.text}
            disabled={disabled}
            label="מועד / אבן דרך"
            onChange={event =>
              onChange({
                ...quotation,
                paymentSchedule: schedule.map((current, currentIndex) =>
                  currentIndex === index ? { ...current, text: event.target.value } : current,
                ),
              })
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
                onChange({
                  ...quotation,
                  paymentSchedule: schedule.filter(
                    (_stage, currentIndex) => currentIndex !== index,
                  ),
                })
              }
            />
          )}
        </div>
      ))}
      <div className={styles.row}>
        <span className={styles.muted}>סה״כ {scheduleTotal}%</span>
        {!disabled && (
          <Button
            text="הוסף שלב תשלום"
            size={BUTTON_SIZES.COMPACT}
            variant={BUTTON_VARIANTS.NEUTRAL}
            onClick={() =>
              onChange({ ...quotation, paymentSchedule: [...schedule, { percent: "0", text: "" }] })
            }
          />
        )}
      </div>
      <QuotationInput
        maxLength={1000}
        disabled={disabled}
        value={quotation.paymentTermsNote}
        label="הערה לתנאי התשלום (להצעה זו בלבד)"
        onChange={event => onChange({ ...quotation, paymentTermsNote: event.target.value })}
      />
    </Card>
  );
};
export default QuotationPayments;
