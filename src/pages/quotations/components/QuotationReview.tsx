import {
  BUTTON_SIZES,
  BUTTON_VARIANTS,
} from "../../../components/Button/constants/button.constants";

import { Fragment, type FC } from "react";
import styles from "../quotation.module.css";
import Card from "../../../components/Card/Card";
import Button from "../../../components/Button/Button";
import { isPaymentTerms } from "../../../utilities/guards/api.guard";
import type { IQuotation } from "../../../interfaces/quotation.interface";
import { PAYMENT_TERMS_LABELS } from "../../../constants/payment-terms.constant";
import { quotationReviewSections } from "../../../utilities/quotation-presentation.utility";

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
  const sections = quotationReviewSections(quotation);
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
        {editable && (
          <Button
            text="עריכה"
            onClick={onEdit}
            size={BUTTON_SIZES.COMPACT}
            variant={BUTTON_VARIANTS.SECONDARY}
          />
        )}
      </div>
      <p className={styles.muted}>כל ההתראות הן התראות חובה. יש לטפל בהן או לאשר חריג במפורש.</p>
      <div className={styles.viewTable}>
        <table>
          <thead>
            <tr>
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
            {sections.map(section => (
              <Fragment key={section.id}>
                <tr className={styles.reviewSection}>
                  <th colSpan={7} scope="colgroup">
                    {section.title}
                  </th>
                </tr>
                {section.items.map(line => (
                  <tr key={line.id}>
                    <td>{line.location}</td>
                    <td className={styles.skuCell}>{line.sku}</td>
                    <td>{line.description}</td>
                    <td>{line.capacityBtu}</td>
                    <td>{line.quantityLabel}</td>
                    <td>{line.priceLabel}</td>
                    <td>{line.amount}</td>
                  </tr>
                ))}
              </Fragment>
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
