import {
  PAYMENT_TERMS_VALUES,
  PAYMENT_TERMS_LABELS,
} from "../../../constants/payment-terms.constant";

import type { FC } from "react";
import styles from "../quotation.module.css";
import QuotationInput from "./QuotationInput";
import QuotationSelect from "./QuotationSelect";
import Card from "../../../components/Card/Card";
import Button from "../../../components/Button/Button";
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
  return (
    <Card>
      <h2 className={styles.heading}>תנאי תשלום</h2>
      <p className={styles.muted}>הועתקו מהלקוח ביצירת ההצעה. שינויים כאן נשמרים בהצעה זו בלבד.</p>
      <QuotationSelect
        label="תנאי תשלום"
        disabled={disabled}
        value={quotation.paymentTerms ?? ""}
        onChange={event => onChange({ ...quotation, paymentTerms: event.target.value || null })}
      >
        <option value="">בחרו תנאי תשלום...</option>
        {PAYMENT_TERMS_VALUES.map(value => (
          <option key={value} value={value}>
            {PAYMENT_TERMS_LABELS[value].title}
          </option>
        ))}
      </QuotationSelect>
      <QuotationInput
        maxLength={1000}
        disabled={disabled}
        value={quotation.paymentTermsNote}
        label="הערה לתנאי התשלום (להצעה זו בלבד)"
        onChange={event => onChange({ ...quotation, paymentTermsNote: event.target.value })}
      />
      {schedule.map((stage, index) => (
        <div key={index} className={styles.grid}>
          <QuotationInput
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
          {!disabled && (
            <Button
              text="הסר שלב"
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
      {!disabled && (
        <Button
          text="הוסף שלב תשלום"
          onClick={() =>
            onChange({ ...quotation, paymentSchedule: [...schedule, { percent: "0", text: "" }] })
          }
        />
      )}
    </Card>
  );
};
export default QuotationPayments;
