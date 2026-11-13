import {
  buildProjectQuotationPath,
  formatProjectQuotationsSubtitle,
} from "../../../utilities/quotation-sharing.utility";

import type { FC } from "react";
import { Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { usePageStyles } from "../../page.style";
import Card from "../../../components/Card/Card";
import Button from "../../../components/Button/Button";
import { ICON_NAMES } from "../../../constants/icon.constant";
import CardHeader from "../../../components/CardHeader/CardHeader";
import QuotationRow from "../../quotations/components/QuotationRow";
import ProjectQuotationRowDetails from "./ProjectQuotationRowDetails";
import InlineError from "../../../components/InlineError/InlineError";
import LoadingState from "../../../components/LoadingState/LoadingState";
import { getApiErrorMessage } from "../../../utilities/api-error.utility";
import { useProjectQuotationsQuery } from "../../../hooks/queries/quotation.query";
import { BUTTON_VARIANTS } from "../../../components/Button/constants/button.constants";
import { PROJECT_QUOTATIONS_COPY } from "../../../constants/quotation-sharing.constant";

interface IProjectQuotationsCardProps {
  projectId: string;
}

const ProjectQuotationsCard: FC<IProjectQuotationsCardProps> = ({ projectId }) => {
  const navigate = useNavigate();
  const styles = usePageStyles();
  const quotationsQuery = useProjectQuotationsQuery(projectId);

  const pages = quotationsQuery.data?.pages ?? [];
  const quotations = pages.flatMap(page => page.items);
  const total = pages.at(0)?.total ?? 0;
  const isEmpty = quotationsQuery.isSuccess && quotations.length === 0;

  const retry = async () => {
    await quotationsQuery.refetch();
  };

  const loadMore = async () => {
    await quotationsQuery.fetchNextPage();
  };

  return (
    <Box component="section" aria-label={PROJECT_QUOTATIONS_COPY.TITLE}>
      <Card gap="16px">
        <CardHeader
          icon={ICON_NAMES.QUOTE}
          title={PROJECT_QUOTATIONS_COPY.TITLE}
          subtitle={formatProjectQuotationsSubtitle(total)}
        />
        {quotationsQuery.isPending && <LoadingState label={PROJECT_QUOTATIONS_COPY.LOADING} />}
        {quotationsQuery.isError && (
          <>
            <InlineError message={getApiErrorMessage(quotationsQuery.error)} />
            <Button
              onClick={retry}
              variant={BUTTON_VARIANTS.NEUTRAL}
              text={PROJECT_QUOTATIONS_COPY.RETRY}
            />
          </>
        )}
        {isEmpty && (
          <Box component="span" sx={styles.caption}>
            {PROJECT_QUOTATIONS_COPY.EMPTY}
          </Box>
        )}
        {quotations.map(quotation => (
          <QuotationRow
            key={quotation.id}
            quotation={quotation}
            onOpen={() => navigate(buildProjectQuotationPath(quotation))}
            details={<ProjectQuotationRowDetails quotation={quotation} />}
          />
        ))}
        {quotationsQuery.hasNextPage && (
          <Button
            onClick={loadMore}
            variant={BUTTON_VARIANTS.NEUTRAL}
            text={PROJECT_QUOTATIONS_COPY.LOAD_MORE}
            isLoading={quotationsQuery.isFetchingNextPage}
          />
        )}
      </Card>
    </Box>
  );
};

export default ProjectQuotationsCard;
