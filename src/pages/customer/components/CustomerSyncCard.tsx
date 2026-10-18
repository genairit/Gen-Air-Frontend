import {
  formatLastSynced,
  formatSyncAttempts,
  getCustomerSyncSteps,
} from "../../../utilities/customer.utility";

import {
  CUSTOMER_PAGE_COPY,
  CUSTOMER_SYNC_SUBTITLE_BY_STATUS,
} from "../../../constants/customer.constant";

import {
  PRIORITY_SYNC_STATUSES,
  type PrioritySyncStatusType,
} from "../../../constants/priority-sync.constant";

import { Box } from "@mui/material";
import type { FC, ReactNode } from "react";
import { usePageStyles } from "../../page.style";
import Card from "../../../components/Card/Card";
import CustomerSyncStep from "./CustomerSyncStep";
import { useStyles } from "./CustomerSyncCard.style";
import { ICON_NAMES } from "../../../constants/icon.constant";
import DetailTile from "../../../components/DetailTile/DetailTile";
import CardHeader from "../../../components/CardHeader/CardHeader";
import type { IApiCustomer } from "../../../interfaces/api.interface";
import NoticeBanner from "../../../components/NoticeBanner/NoticeBanner";

interface ICustomerSyncCardProps {
  customer: IApiCustomer;
}

const CustomerSyncCard: FC<ICustomerSyncCardProps> = ({ customer }) => {
  const styles = useStyles();
  const pageStyles = usePageStyles();
  const isFailed = customer.prioritySyncStatus === PRIORITY_SYNC_STATUSES.FAILED;

  const STATUS_DETAILS: Record<PrioritySyncStatusType, () => ReactNode> = {
    synced: () => (
      <Box sx={pageStyles.grid({ minColumnWidth: 220, gap: "14px" })}>
        <DetailTile
          isLtr
          value={customer.priorityId ?? ""}
          label={CUSTOMER_PAGE_COPY.PRIORITY_ID}
        />
        <DetailTile
          isLtr
          value={formatLastSynced(customer)}
          label={CUSTOMER_PAGE_COPY.LAST_SYNCED}
        />
      </Box>
    ),
    pending: () => (
      <Box component="span" sx={pageStyles.caption}>
        {CUSTOMER_PAGE_COPY.PENDING_NOTE}
      </Box>
    ),
    failed: () => (
      <Box sx={pageStyles.stack({ gap: "14px" })}>
        <NoticeBanner
          title={CUSTOMER_PAGE_COPY.FAILED_TITLE}
          lines={[customer.prioritySyncError ?? "", formatSyncAttempts(customer)]}
        />
        <Box component="span" sx={pageStyles.caption}>
          {CUSTOMER_PAGE_COPY.FAILED_NOTE}
        </Box>
      </Box>
    ),
  };

  return (
    <Card gap="18px" padding="24px" sx={isFailed ? styles.failedCard : null}>
      <CardHeader
        icon={ICON_NAMES.PENDING}
        title={CUSTOMER_PAGE_COPY.SYNC_TITLE}
        subtitle={CUSTOMER_SYNC_SUBTITLE_BY_STATUS[customer.prioritySyncStatus]}
      />
      <Box sx={pageStyles.grid({ minColumnWidth: 240, gap: "14px" })}>
        {getCustomerSyncSteps(customer).map((step, index) => (
          <CustomerSyncStep step={step} key={step.title} position={index + 1} />
        ))}
      </Box>
      {STATUS_DETAILS[customer.prioritySyncStatus]()}
    </Card>
  );
};

export default CustomerSyncCard;
