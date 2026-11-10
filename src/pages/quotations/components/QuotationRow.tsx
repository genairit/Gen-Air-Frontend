import type { FC, ReactNode } from "react";
import styles from "../quotation.module.css";
import { formatRelativeTime } from "../../../utilities/date.utility";
import { quotationMoney } from "../../../utilities/quotation.utility";
import type { IQuotation } from "../../../interfaces/quotation.interface";
import { QUOTATION_ROW_COPY, QUOTATION_STATUS_LABELS } from "../../../constants/quotation.constant";

interface IQuotationRowProps {
  onOpen: () => void;
  details?: ReactNode;
  quotation: IQuotation;
}

const QuotationRow: FC<IQuotationRowProps> = ({ quotation, onOpen, details = null }) => {
  const brands = quotation.brands.join(" · ") || QUOTATION_ROW_COPY.GENERAL;

  return (
    <button type="button" onClick={onOpen} className={styles.quoteRow}>
      <bdi className={styles.number}>{quotation.number}</bdi>
      <div className={styles.quoteIdentity}>
        <b>{quotation.customerName ?? QUOTATION_ROW_COPY.CUSTOMER}</b>
        <span className={styles.muted}>
          {quotation.projectName ?? QUOTATION_ROW_COPY.NO_PROJECT}
        </span>
        {details}
      </div>
      <span className={styles.muted}>{brands}</span>
      <span className={styles.badge} data-status={quotation.status}>
        {QUOTATION_STATUS_LABELS[quotation.status]}
      </span>
      <b className={styles.quoteAmount}>{quotationMoney(quotation.totals.total)}</b>
      <span className={styles.updated}>{formatRelativeTime(quotation.updatedAt)}</span>
    </button>
  );
};

export default QuotationRow;
