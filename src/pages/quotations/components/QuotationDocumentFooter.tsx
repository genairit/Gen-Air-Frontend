import type { FC } from "react";
import { Box } from "@mui/material";
import styles from "../quotation-document.module.css";
import type { IQuotation } from "../../../interfaces/quotation.interface";
import { quotationPaymentParagraphs } from "../../../utilities/quotation-document.utility";
import type { IQuotationDocumentContext } from "../../../interfaces/quotation-document.interface";

interface IQuotationDocumentFooterProps {
  quotation: IQuotation;
  context: IQuotationDocumentContext;
}
const QuotationDocumentFooter: FC<IQuotationDocumentFooterProps> = ({ quotation, context }) => {
  const { metadata, recipient, recipientContext, terms } = context;
  const currentCustomer = recipientContext.customerId === quotation.customerId;
  const totals = [
    ["סכום ביניים", quotation.totals.subtotal],
    ["הנחה / התאמה", quotation.totals.discount],
    ["מחיר לפני מע״מ", quotation.totals.pretax],
    [`מע״מ (${quotation.vatRate}%)`, quotation.totals.vat],
    ["סה״כ מחיר", quotation.totals.total],
  ];
  const metadataRows = [
    ["בתוקף עד:", metadata.validUntil],
    [
      "סוכן:",
      recipientContext.salesAgentId === quotation.salesAgentId ? metadata.salesAgent : null,
    ],
    ["מס. לקוח:", currentCustomer ? recipient.customerNumber : null],
    [metadata.customerTaxLabel, currentCustomer ? metadata.customerTaxId : null],
    ["מספר תיק במע״מ:", metadata.vatFileNumber],
    ["מהדורה נוכחית:", String(quotation.version)],
  ];
  const termSections = [
    { heading: "תנאים כלליים", paragraphs: terms.general },
    {
      heading: "תנאי תשלום",
      paragraphs: quotationPaymentParagraphs(quotation, context),
      stages: quotation.paymentSchedule,
    },
    { heading: "מסירה", paragraphs: terms.delivery },
    { heading: "אחריות", paragraphs: terms.warranty },
    { heading: "תנאים נוספים", paragraphs: terms.additional },
  ];
  return (
    <>
      <Box component="div" className={styles.summary}>
        <Box component="div">
          {metadataRows.map(
            ([label, value]) =>
              value && (
                <Box key={label} component="div">
                  <Box component="strong">{label}</Box> <Box component="bdi">{value}</Box>
                </Box>
              ),
          )}
        </Box>
        <Box component="dl" className={styles.totals}>
          {totals.map(([label, value]) => (
            <Box key={label} component="div">
              <Box component="dt">{label}</Box>
              <Box component="dd">
                <Box component="bdi">{value} ₪</Box>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
      {termSections.map(
        ({ heading, paragraphs, stages }) =>
          (paragraphs.length > 0 || !!stages?.length) && (
            <Box key={heading} component="section" className={styles.term}>
              <Box component="h3">{heading}</Box>
              {stages && stages.length > 0 && (
                <Box component="ul">
                  {stages.map((stage, index) => (
                    <Box key={index} component="li">
                      {stage.percent}% — {stage.text}
                    </Box>
                  ))}
                </Box>
              )}
              {paragraphs.map((paragraph, index) => (
                <Box key={index} component="p">
                  {paragraph}
                </Box>
              ))}
            </Box>
          ),
      )}
      <Box component="section" className={styles.approval}>
        <Box component="h3">אישור הזמנה</Box>
        <Box component="p">{terms.approval}</Box>
        <Box component="div" className={styles.signatures}>
          <Box component="span">שם המזמין:</Box>
          <Box component="span">תאריך אישור הזמנה:</Box>
          <Box component="span">מס׳ ת״ז (ח.פ.) המזמין:</Box>
          <Box component="span">חתימה:</Box>
        </Box>
      </Box>
      <Box component="footer" className={styles.issuer}>
        בברכה: {context.issuerName}
        <Box component="strong">{context.company.name}</Box>
      </Box>
    </>
  );
};
export default QuotationDocumentFooter;
