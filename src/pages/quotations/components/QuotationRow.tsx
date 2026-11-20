import { Box } from "@mui/material";
import type { FC, ReactNode } from "react";
import styles from "../quotation.module.css";
import ChoiceRow from "../../../components/ChoiceRow/ChoiceRow";
import { formatRelativeTime } from "../../../utilities/date.utility";
import { quotationMoney } from "../../../utilities/quotation.utility";
import type { IQuotation } from "../../../interfaces/quotation.interface";
import { getTableRowSurfaceStyle } from "../../../components/DataTable/DataTable.style";
import { quotationNeedsCorrection } from "../../../utilities/quotation-rejection.utility";
import { QUOTATION_ROW_COPY, QUOTATION_STATUS_LABELS } from "../../../constants/quotation.constant";

interface IQuotationRowProps {
  onOpen: () => void;
  details?: ReactNode;
  quotation: IQuotation;
}

const QuotationRow: FC<IQuotationRowProps> = ({ quotation, onOpen, details = null }) => {
  const brands = quotation.brands.join(" · ") || QUOTATION_ROW_COPY.GENERAL;
  const needsCorrection = quotationNeedsCorrection(quotation);

  return (
    <ChoiceRow
      onClick={onOpen}
      className={styles.quoteRow}
      sx={{
        ...getTableRowSurfaceStyle({ isDimmed: false, isClickable: true }),
        display: "grid",
        padding: { xs: "14px 12px", sm: "10px 20px" },
      }}
    >
      <Box component="bdi" className={styles.number}>
        {quotation.number}
      </Box>
      <Box component="div" className={styles.quoteIdentity}>
        <Box component="b">{quotation.customerName ?? QUOTATION_ROW_COPY.CUSTOMER}</Box>
        <Box component="span" className={styles.muted}>
          {quotation.projectName ?? QUOTATION_ROW_COPY.NO_PROJECT}
        </Box>
        {details}
      </Box>
      <Box component="span" className={styles.muted}>
        {brands}
      </Box>
      <Box
        component="span"
        className={styles.badge}
        data-status={quotation.status}
        data-needs-correction={needsCorrection}
      >
        {needsCorrection ? "נדרש תיקון" : QUOTATION_STATUS_LABELS[quotation.status]}
      </Box>
      <Box component="b" className={styles.quoteAmount}>
        {quotationMoney(quotation.totals.total)}
      </Box>
      <Box component="span" className={styles.updated}>
        {formatRelativeTime(quotation.updatedAt)}
      </Box>
    </ChoiceRow>
  );
};

export default QuotationRow;
