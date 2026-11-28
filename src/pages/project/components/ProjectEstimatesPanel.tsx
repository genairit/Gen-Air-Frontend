import type { FC } from "react";
import { Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import Card from "../../../components/Card/Card";
import { usePageStyles } from "../../page.style";
import Button from "../../../components/Button/Button";
import { useStyles } from "./ProjectQuotationCard.style";
import badgeStyles from "../../quotations/quotation.module.css";
import { SURFACE_DEPTHS } from "../../../constants/surface.constant";
import { formatRelativeTime } from "../../../utilities/date.utility";
import { quotationMoney } from "../../../utilities/quotation.utility";
import InlineError from "../../../components/InlineError/InlineError";
import LoadingState from "../../../components/LoadingState/LoadingState";
import { getApiErrorMessage } from "../../../utilities/api-error.utility";
import { useEstimatesQuery } from "../../../hooks/engineering-estimate.hook";
import { PROJECT_QUOTATIONS_COPY } from "../../../constants/quotation-sharing.constant";
import { BUTTON_VARIANTS } from "../../../components/Button/constants/button.constants";
import { buildEstimateDetailPath } from "../../../utilities/engineering-estimate.utility";
import { ESTIMATE_STATUS_LABELS } from "../../../constants/engineering-estimate.constant";

interface IProjectEstimatesPanelProps {
  projectId: string;
}

const ProjectEstimatesPanel: FC<IProjectEstimatesPanelProps> = ({ projectId }) => {
  const styles = useStyles();
  const page = usePageStyles();
  const navigate = useNavigate();
  const list = useEstimatesQuery(projectId);
  const estimates = list.data?.pages.flatMap(page => page.items) ?? [];

  const isEmpty = list.isSuccess && estimates.length === 0;
  const retry = async (): Promise<void> => {
    await list.refetch();
  };
  const loadMore = async (): Promise<void> => {
    await list.fetchNextPage();
  };

  return (
    <Box component="section" aria-label="כתבי כמויות" sx={page.stack({ gap: "12px" })}>
      {list.isPending && <LoadingState label="טוען כתבי כמויות..." />}
      {list.isError && (
        <Box sx={page.row({ gap: "8px" })}>
          <InlineError message={getApiErrorMessage(list.error)} />
          {!list.isFetchNextPageError && (
            <Button
              size="compact"
              text="נסו שוב"
              onClick={retry}
              variant={BUTTON_VARIANTS.NEUTRAL}
            />
          )}
        </Box>
      )}
      {isEmpty && (
        <Box role="status" sx={page.caption}>
          עדיין אין כתבי כמויות בפרויקט זה
        </Box>
      )}
      {estimates.length > 0 && (
        <Box sx={styles.grid}>
          {estimates.map(estimate => (
            <Card
              gap="12px"
              sx={styles.card}
              key={estimate.id}
              depth={SURFACE_DEPTHS.FLAT}
              onClick={() => navigate(buildEstimateDetailPath(estimate.id))}
              ariaLabel={`${estimate.name} · ${ESTIMATE_STATUS_LABELS[estimate.status]}`}
            >
              <Box sx={styles.header}>
                <Box sx={styles.identity}>
                  <Box component="bdi" sx={styles.number}>
                    {estimate.name}
                  </Box>
                  {estimate.createdByName && (
                    <Box component="bdi" sx={styles.customer}>
                      {estimate.createdByName}
                    </Box>
                  )}
                </Box>
                <Box component="span" className={badgeStyles.badge} data-status={estimate.status}>
                  {ESTIMATE_STATUS_LABELS[estimate.status]}
                </Box>
              </Box>
              <Box sx={styles.footer}>
                {estimate.subtotal != null && (
                  <Box component="bdi" sx={styles.amount}>
                    {quotationMoney(estimate.subtotal)}
                  </Box>
                )}
                <Box component="time" sx={styles.updated} dateTime={estimate.updatedAt}>
                  {PROJECT_QUOTATIONS_COPY.UPDATED} {formatRelativeTime(estimate.updatedAt)}
                </Box>
              </Box>
            </Card>
          ))}
        </Box>
      )}
      {list.hasNextPage && (
        <Box sx={page.endRow}>
          <Button
            size="compact"
            onClick={loadMore}
            variant={BUTTON_VARIANTS.NEUTRAL}
            disabled={list.isFetchingNextPage}
            isLoading={list.isFetchingNextPage}
            text={list.isFetchNextPageError ? "נסו שוב" : "טענו עוד"}
          />
        </Box>
      )}
    </Box>
  );
};

export default ProjectEstimatesPanel;
