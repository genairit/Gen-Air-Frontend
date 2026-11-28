import type { FC } from "react";
import { Box } from "@mui/material";
import styles from "../quotation-document.module.css";
import BrandLogo from "../../../components/BrandLogo/BrandLogo";
import type { IQuotation } from "../../../interfaces/quotation.interface";
import { quotationDocumentDate } from "../../../utilities/quotation-document.utility";
import type { IQuotationDocumentContext } from "../../../interfaces/quotation-document.interface";

interface IQuotationDocumentHeaderProps {
  quotation: IQuotation;
  context: IQuotationDocumentContext;
}
const QuotationDocumentHeader: FC<IQuotationDocumentHeaderProps> = ({ quotation, context }) => {
  const { company, recipientContext } = context;
  const currentRecipient =
    recipientContext.customerId === quotation.customerId &&
    recipientContext.projectId === quotation.projectId;
  const recipient = currentRecipient ? context.recipient : null;
  const project = currentRecipient ? context.project : null;
  return (
    <Box component="header">
      <Box component="h2" className={styles.title}>
        {context.title} מספר <Box component="bdi">{quotation.number}</Box>
      </Box>
      <Box component="div" className={styles.letterhead}>
        <Box component="div">
          <Box component="strong">{company.name}</Box>
          <Box component="div">{company.address}</Box>
          <Box component="div">{company.city}</Box>
          {company.phone && (
            <Box component="div">
              טלפון: <Box component="bdi">{company.phone}</Box>
            </Box>
          )}
          <Box component="div">
            עוסק מורשה: <Box component="bdi">{company.businessNumber}</Box>
          </Box>
          <Box component="div">
            מספר תיק במע״מ: <Box component="bdi">{company.vatFileNumber}</Box>
          </Box>
        </Box>
        <Box component="div" className={styles.brand}>
          <BrandLogo width="100%" />
          {company.email && (
            <Box dir="ltr" component="small">
              e-mail: {company.email}
            </Box>
          )}
        </Box>
      </Box>
      <Box component="div" className={styles.identifiers}>
        <Box component="div" aria-busy={!currentRecipient}>
          לכבוד:
          <Box component="div">
            <Box component="strong">
              {currentRecipient ? recipient?.name : quotation.customerName}
            </Box>
          </Box>
          <Box component="div">{recipient?.address}</Box>
          <Box component="div">{recipient?.city}</Box>
          <Box component="div">
            <Box component="bdi">{recipient?.email}</Box>
          </Box>
          {recipient?.phone && (
            <Box component="div">
              טלפון: <Box component="bdi">{recipient.phone}</Box>
            </Box>
          )}
        </Box>
        <Box component="div">
          <Box component="strong">{currentRecipient ? project?.name : quotation.projectName}</Box>
          <Box component="div">{project?.address}</Box>
        </Box>
        <Box component="div">
          <Box component="div">
            תאריך ההצעה: <Box component="bdi">{quotationDocumentDate(quotation.date)}</Box>
          </Box>
          <Box component="div">
            תאריך הדפסה: <Box component="bdi">{context.printDate}</Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
export default QuotationDocumentHeader;
