import type { FC } from "react";
import styles from "../quotation.module.css";
import Card from "../../../components/Card/Card";
import Button from "../../../components/Button/Button";
import QuotationDecimalInput from "./QuotationDecimalInput";
import { quotationMoney } from "../../../utilities/quotation.utility";
import { QUOTATION_STATUS } from "../../../constants/quotation.constant";
import type { IQuotation, TQuotationStatus } from "../../../interfaces/quotation.interface";

interface IQuotationSummaryProps {
  blocked: boolean;
  disabled: boolean;
  canApprove: boolean;
  quotation: IQuotation;
  onChange: (quotation: IQuotation) => void;
  onAcknowledge: (keys: string[]) => Promise<void>;
  onTransition: (status: TQuotationStatus) => Promise<void>;
}
const QuotationSummary: FC<IQuotationSummaryProps> = ({
  quotation,
  disabled,
  canApprove,
  blocked,
  onChange,
  onTransition,
  onAcknowledge,
}: IQuotationSummaryProps) => {
  const totals = quotation.totals;
  const openWarnings = quotation.warnings.filter(warning => !warning.acknowledged);
  const acknowledged = quotation.warnings
    .filter(warning => warning.acknowledged)
    .map(warning => warning.key);
  const isDraft = quotation.status === QUOTATION_STATUS.DRAFT;
  const isReview = quotation.status === QUOTATION_STATUS.REVIEW;
  const isApproved = quotation.status === QUOTATION_STATUS.APPROVED;
  const amounts = [
    { label: "סכום השורות", value: totals.subtotal },
    { label: "הנחה / התאמה ליעד", value: totals.discount },
    { label: "מחיר כולל לפני מע״מ", value: totals.pretax },
    { label: `מע״מ ${quotation.vatRate}%`, value: totals.vat },
  ];
  const toggle = (key: string, checked: boolean) =>
    onAcknowledge(
      checked ? [...acknowledged, key] : acknowledged.filter(current => current !== key),
    );
  return (
    <div className={styles.summary}>
      <Card>
        {amounts.map(amount => (
          <div key={amount.label} className={styles.between}>
            <span>{amount.label}</span>
            <b>{quotationMoney(amount.value)}</b>
          </div>
        ))}
        <div className={styles.between}>
          <b>סה״כ כולל מע״מ</b>
          <span className={styles.total}>{quotationMoney(totals.total)}</span>
        </div>
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
        <span className={styles.muted}>
          סכום היעד גובר על אחוז ההנחה. הסכומים מתעדכנים לאחר שמירה בשרת.
        </span>
      </Card>
      <Card>
        <h2 className={styles.heading}>בדיקה ואישור</h2>
        <p className={styles.muted}>
          {openWarnings.length} התראות חובה פתוחות מתוך {quotation.warnings.length}
        </p>
        {blocked && <p role="status">יש להמתין לשמירה מוצלחת לפני בדיקה ואישור.</p>}
        {quotation.warnings.map(warning => (
          <label key={warning.key} className={styles.warning}>
            <input
              type="checkbox"
              checked={warning.acknowledged}
              disabled={!canApprove || blocked || isApproved}
              onChange={event => toggle(warning.key, event.target.checked)}
            />
            <span>
              {warning.text}
              <br />
              <b>חריג — מאושר במפורש</b>
            </span>
          </label>
        ))}
        {!quotation.warnings.length && !blocked && <p>אין התראות פתוחות</p>}
        {canApprove && (
          <div className={styles.stack}>
            {isDraft && (
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
                <Button
                  text="חזרה לטיוטה"
                  disabled={blocked}
                  onClick={() => onTransition(QUOTATION_STATUS.DRAFT)}
                />
              </>
            )}
            {isApproved && (
              <Button
                disabled={blocked}
                text="פתיחה לעריכה (אותו מזהה)"
                onClick={() => onTransition(QUOTATION_STATUS.DRAFT)}
              />
            )}
          </div>
        )}
      </Card>
    </div>
  );
};
export default QuotationSummary;
