import {
  BUTTON_SIZES,
  BUTTON_VARIANTS,
} from "../../../components/Button/constants/button.constants";

import Button from "./QuotationButton";
import styles from "../quotation.module.css";
import Card from "../../../components/Card/Card";
import Icon from "../../../components/Icon/Icon";
import { Fragment, type ReactNode, type FC } from "react";
import { ICON_NAMES } from "../../../constants/icon.constant";
import type { IQuotation } from "../../../interfaces/quotation.interface";
import { quotationPaymentLabel } from "../../../utilities/quotation-payment.utility";
import { Box, Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";
import { quotationReviewSections } from "../../../utilities/quotation-presentation.utility";
import { quotationCancellationNoun } from "../../../utilities/quotation-cancellation.utility";

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
  const documentNoun = quotationCancellationNoun(quotation);
  const terms = quotationPaymentLabel(quotation);
  const schedule = quotation.paymentSchedule
    .map(stage => `${stage.percent}% ${stage.text}`)
    .join(" · ");
  return (
    <Card>
      <Box component="div" className={styles.between}>
        <Box component="div" className={styles.cardTitle}>
          <Box component="span" aria-hidden="true" className={styles.cardIcon}>
            <Icon name={ICON_NAMES.QUOTE} />
          </Box>
          <Box component="div">
            <Box component="h2">סיכום לבדיקה</Box>
            <Box component="p" className={styles.muted}>
              השורות לפי סדר הצעת מחיר, כפי שיופיעו ב{documentNoun}
            </Box>
          </Box>
        </Box>
        {editable && (
          <Button
            text="עריכה"
            onClick={onEdit}
            size={BUTTON_SIZES.COMPACT}
            variant={BUTTON_VARIANTS.NEUTRAL}
          />
        )}
      </Box>
      {warnings}
      <Box component="div" className={styles.viewTable}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>מיקום</TableCell>
              <TableCell>מק״ט</TableCell>
              <TableCell>תיאור</TableCell>
              <TableCell>BTU</TableCell>
              <TableCell>כמות</TableCell>
              <TableCell>מחיר</TableCell>
              <TableCell>סה״כ</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sections.map(section => (
              <Fragment key={section.id}>
                <TableRow className={styles.reviewSection}>
                  <TableCell colSpan={7} component="th" scope="colgroup">
                    {section.title}
                  </TableCell>
                </TableRow>
                {section.items.map(line => (
                  <TableRow key={line.id}>
                    <TableCell>{line.location}</TableCell>
                    <TableCell className={styles.skuCell}>{line.sku}</TableCell>
                    <TableCell>{line.description}</TableCell>
                    <TableCell>{line.capacityBtu}</TableCell>
                    <TableCell>{line.quantityLabel}</TableCell>
                    <TableCell>{line.priceLabel}</TableCell>
                    <TableCell>{line.amount}</TableCell>
                  </TableRow>
                ))}
              </Fragment>
            ))}
          </TableBody>
        </Table>
      </Box>
      <Box component="p">תנאי תשלום: {terms}</Box>
      <Box component="p">{schedule}</Box>
      <Box component="p">{quotation.paymentTermsNote}</Box>
    </Card>
  );
};
export default QuotationReview;
