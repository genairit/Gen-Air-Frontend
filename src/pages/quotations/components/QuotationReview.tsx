import type { FC } from "react";
import styles from "../quotation.module.css";
import Card from "../../../components/Card/Card";
import Button from "../../../components/Button/Button";
import { isPaymentTerms } from "../../../utilities/guards/api.guard";
import type { IQuotation } from "../../../interfaces/quotation.interface";
import { PAYMENT_TERMS_LABELS } from "../../../constants/payment-terms.constant";
import { quotationMoney, quotationLineMoney } from "../../../utilities/quotation.utility";

interface IQuotationReviewProps {
  editable: boolean;
  onEdit: () => void;
  quotation: IQuotation;
}
const QuotationReview: FC<IQuotationReviewProps> = ({
  quotation,
  editable,
  onEdit,
}: IQuotationReviewProps) => {
  const rows = quotation.sections.flatMap(section =>
    section.items.map(line => ({
      ...line,
      sectionTitle: section.title,
      amount: quotationLineMoney(line),
      priceLabel: quotationMoney(line.quotedPrice),
    })),
  );
  const terms = isPaymentTerms(quotation.paymentTerms)
    ? PAYMENT_TERMS_LABELS[quotation.paymentTerms].title
    : "לא נבחרו תנאים";
  const schedule = quotation.paymentSchedule
    .map(stage => `${stage.percent}% ${stage.text}`)
    .join(" · ");
  return (
    <Card>
      <div className={styles.between}>
        <h2 className={styles.heading}>סיכום לבדיקה</h2>
        {editable && <Button text="עריכה" onClick={onEdit} />}
      </div>
      <p className={styles.muted}>כל ההתראות הן התראות חובה. יש לטפל בהן או לאשר חריג במפורש.</p>
      <div className={styles.viewTable}>
        <table>
          <thead>
            <tr>
              <th>מערכת / קומה</th>
              <th>מיקום</th>
              <th>מק״ט</th>
              <th>תיאור</th>
              <th>BTU</th>
              <th>כמות</th>
              <th>מחיר</th>
              <th>סה״כ</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(line => (
              <tr key={line.id}>
                <td>{line.sectionTitle}</td>
                <td>{line.location}</td>
                <td>{line.sku}</td>
                <td>{line.description}</td>
                <td>{line.capacityBtu}</td>
                <td>{line.quantity}</td>
                <td>{line.priceLabel}</td>
                <td>{line.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p>תנאי תשלום: {terms}</p>
      <p>{schedule}</p>
      <p>{quotation.paymentTermsNote}</p>
    </Card>
  );
};
export default QuotationReview;
