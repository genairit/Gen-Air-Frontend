import type { FC } from "react";
import { Box } from "@mui/material";
import { useStyles } from "./QuotationApartmentSharing.style";
import { formatSharedCount } from "../../../../utilities/quotation-sharing.utility";
import { QUOTATION_SHARING_COPY } from "../../../../constants/quotation-sharing.constant";

interface IQuotationSharingSummaryProps {
  isSaved?: boolean;
  sharedCount: number;
}

const QuotationSharingSummary: FC<IQuotationSharingSummaryProps> = ({
  sharedCount,
  isSaved = false,
}) => {
  const styles = useStyles();

  const isShared = sharedCount > 0;

  return (
    <Box sx={styles.summary}>
      {isShared && (
        <Box component="span" sx={styles.summaryTitle}>
          {formatSharedCount(sharedCount)}
        </Box>
      )}
      {!isShared && (
        <Box component="span" sx={styles.caption}>
          {QUOTATION_SHARING_COPY.NOT_SHARED}
        </Box>
      )}
      {isSaved && (
        <Box role="status" component="span" sx={styles.status}>
          {QUOTATION_SHARING_COPY.SAVED}
        </Box>
      )}
    </Box>
  );
};

export default QuotationSharingSummary;
