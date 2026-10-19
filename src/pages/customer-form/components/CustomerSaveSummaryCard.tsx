import {
  CUSTOMER_FORM_COPY,
  CUSTOMER_FORM_SUMMARY,
} from "../../../constants/customer-form.constant";

import type { FC } from "react";
import { Box } from "@mui/material";
import { usePageStyles } from "../../page.style";
import Card from "../../../components/Card/Card";
import { ICON_NAMES } from "../../../constants/icon.constant";
import CardHeader from "../../../components/CardHeader/CardHeader";
import DetailTile from "../../../components/DetailTile/DetailTile";

interface ICustomerSaveSummaryCardProps {
  creatorName: string;
}

const CustomerSaveSummaryCard: FC<ICustomerSaveSummaryCardProps> = ({ creatorName }) => {
  const styles = usePageStyles();

  return (
    <Card gap="18px">
      <CardHeader
        icon={ICON_NAMES.INFO}
        title={CUSTOMER_FORM_COPY.SUMMARY}
        subtitle={CUSTOMER_FORM_COPY.SUMMARY_SUBTITLE}
      />
      <Box sx={styles.grid({ minColumnWidth: 200, gap: "14px" })}>
        <DetailTile
          label={CUSTOMER_FORM_SUMMARY.PRIORITY_ID}
          value={CUSTOMER_FORM_SUMMARY.PRIORITY_ID_VALUE}
        />
        <DetailTile value={creatorName} label={CUSTOMER_FORM_SUMMARY.CREATED_BY} />
        <DetailTile
          label={CUSTOMER_FORM_SUMMARY.SYNC_STATUS}
          value={CUSTOMER_FORM_SUMMARY.SYNC_STATUS_VALUE}
        />
      </Box>
    </Card>
  );
};

export default CustomerSaveSummaryCard;
