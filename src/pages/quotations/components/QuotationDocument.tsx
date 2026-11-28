import type { FC } from "react";
import { Box } from "@mui/material";
import QuotationButton from "./QuotationButton";
import styles from "../quotation-document.module.css";
import QuotationDocumentItems from "./QuotationDocumentItems";
import QuotationDocumentHeader from "./QuotationDocumentHeader";
import QuotationDocumentFooter from "./QuotationDocumentFooter";
import InlineError from "../../../components/InlineError/InlineError";
import LoadingState from "../../../components/LoadingState/LoadingState";
import type { IQuotation } from "../../../interfaces/quotation.interface";
import { useQuotationDocumentContext } from "../../../hooks/queries/quotation-document.query";

interface IQuotationDocumentProps {
  quotation: IQuotation;
}

const QuotationDocument: FC<IQuotationDocumentProps> = ({ quotation }) => {
  const preview = useQuotationDocumentContext(quotation);
  if (preview.isError) {
    return (
      <Box component="div" className={styles.feedback}>
        <InlineError message="לא ניתן לטעון את מסמך ההצעה." />
        <QuotationButton
          text="נסו שוב"
          onClick={async () => {
            await preview.refetch();
          }}
        />
      </Box>
    );
  }
  if (!preview.data) {
    return <LoadingState label="טוען מסמך הצעה…" />;
  }

  return (
    <Box dir="rtl" lang="he" component="article" aria-label="מסמך ההצעה" className={styles.paper}>
      <QuotationDocumentHeader quotation={quotation} context={preview.data} />
      <QuotationDocumentItems quotation={quotation} />
      <QuotationDocumentFooter quotation={quotation} context={preview.data} />
    </Box>
  );
};
export default QuotationDocument;
