import {
  BUTTON_SIZES,
  BUTTON_VARIANTS,
} from "../../../components/Button/constants/button.constants";

import styles from "../quotation.module.css";
import Card from "../../../components/Card/Card";
import Icon from "../../../components/Icon/Icon";
import Button from "../../../components/Button/Button";
import { Fragment, type ReactNode, type FC } from "react";
import { ICON_NAMES } from "../../../constants/icon.constant";
import { isPaymentTerms } from "../../../utilities/guards/api.guard";
import type { IQuotation } from "../../../interfaces/quotation.interface";
import { PAYMENT_TERMS_LABELS } from "../../../constants/payment-terms.constant";
import { quotationReviewSections } from "../../../utilities/quotation-presentation.utility";

interface IQuotationReviewProps {
  editable: boolean;
  onEdit: () => void;
  warnings?: ReactNode;
  quotation: IQuotation;
}
const QuotationReview: FC<IQuotationReviewProps> = ({
  quotation,
  editable,
  warnings,
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
        <div className={styles.cardTitle}>
          <span aria-hidden="true" className={styles.cardIcon}>
            <Icon name={ICON_NAMES.QUOTE} />
          </span>
          <div>
            <h2>סיכום לבדיקה</h2>
            <p className={styles.muted}>השורות לפי סדר הצעת מחיר, כפי שיופיעו בהצעה</p>
          </div>
        </div>
        {editable && (
          <Button
            text="עריכה"
            onClick={onEdit}
            size={BUTTON_SIZES.COMPACT}
            variant={BUTTON_VARIANTS.NEUTRAL}
          />
        )}
      </div>
      {warnings}
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
