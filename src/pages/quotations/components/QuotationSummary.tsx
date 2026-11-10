import Button from "./QuotationButton";
import type { FC, ReactNode } from "react";
import styles from "../quotation.module.css";
import Card from "../../../components/Card/Card";
import QuotationWarnings from "./QuotationWarnings";
import QuotationDecimalInput from "./QuotationDecimalInput";
import { quotationMoney } from "../../../utilities/quotation.utility";
import { QUOTATION_STATUS } from "../../../constants/quotation.constant";
import { BUTTON_VARIANTS } from "../../../components/Button/constants/button.constants";
import { quotationDecimalInput } from "../../../utilities/quotation-presentation.utility";
import type { IQuotation, TQuotationStatus } from "../../../interfaces/quotation.interface";

interface IQuotationSummaryProps {
  blocked: boolean;
  disabled: boolean;
  canApprove: boolean;
  quotation: IQuotation;
  showWarnings?: boolean;
  deleteAction?: ReactNode;
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
  deleteAction,
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
  const isCancelled = quotation.status === QUOTATION_STATUS.CANCELLED;
  const shouldShowNoWarningsMessage = quotation.warnings.length === 0 && !blocked;
  const progressMaximum = Math.max(quotation.warnings.length, 1);
  const progressValue = quotation.warnings.length ? acknowledged.length : 1;
  const amounts = [
    { label: "סכום השורות", value: totals.subtotal },
    { label: "הנחה / התאמה ליעד", value: totals.discount },
    { label: "מחיר כולל לפני מע״מ", value: totals.pretax },
    { label: `מע״מ ${quotationDecimalInput(quotation.vatRate)}%`, value: totals.vat },
  ];
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
        <progress
          max={progressMaximum}
          value={progressValue}
          aria-label="התקדמות בדיקת הצעה"
          className={styles.reviewProgress}
        />
        <p className={styles.muted}>
          {openWarnings.length} התראות חובה פתוחות מתוך {quotation.warnings.length}
        </p>
        {blocked && <p role="status">יש להמתין לשמירה מוצלחת לפני בדיקה ואישור.</p>}
        {showWarnings && (
          <QuotationWarnings
            blocked={blocked}
            quotation={quotation}
            canApprove={canApprove}
            onAcknowledge={onAcknowledge}
          />
        )}
        {shouldShowNoWarningsMessage && <p>אין התראות פתוחות</p>}
        {canApprove && !isCancelled && (
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
                  variant={BUTTON_VARIANTS.NEUTRAL}
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
      {deleteAction && <div className={styles.deleteAction}>{deleteAction}</div>}
    </div>
  );
};
export default QuotationSummary;
