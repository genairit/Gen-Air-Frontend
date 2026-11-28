import type { FC } from "react";
import { Box } from "@mui/material";
import { usePageStyles } from "../../page.style";
import Button from "../../../components/Button/Button";
import { useStyles } from "./ProjectQuotationCard.style";
import ProjectQuotationCard from "./ProjectQuotationCard";
import { useLocation, useNavigate } from "react-router-dom";
import InlineError from "../../../components/InlineError/InlineError";
import LoadingState from "../../../components/LoadingState/LoadingState";
import { getApiErrorMessage } from "../../../utilities/api-error.utility";
import { useProjectQuotationsQuery } from "../../../hooks/queries/quotation.query";
import { BUTTON_VARIANTS } from "../../../components/Button/constants/button.constants";
import { PROJECT_QUOTATIONS_COPY } from "../../../constants/quotation-sharing.constant";
import { buildProjectQuotationPath } from "../../../utilities/quotation-sharing.utility";

interface IProjectQuotationsCardProps {
  projectId: string;
}

const ProjectQuotationsCard: FC<IProjectQuotationsCardProps> = ({ projectId }) => {
  const styles = useStyles();
  const page = usePageStyles();
  const location = useLocation();
  const navigate = useNavigate();
  const quotationsQuery = useProjectQuotationsQuery(projectId);

  const pages = quotationsQuery.data?.pages ?? [];
  const quotations = pages.flatMap(page => page.items);
  const isEmpty = quotationsQuery.isSuccess && quotations.length === 0;
  const returnState = { quotationReturnTo: location.pathname + location.search };

  const retry = async () => {
    await quotationsQuery.refetch();
  };

  const loadMore = async () => {
    await quotationsQuery.fetchNextPage();
  };

  return (
    <Box
      component="section"
      sx={page.stack({ gap: "12px" })}
      aria-label={PROJECT_QUOTATIONS_COPY.TITLE}
    >
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
        <Box component="span" sx={page.caption}>
          {PROJECT_QUOTATIONS_COPY.EMPTY}
        </Box>
      )}
      {quotations.length > 0 && (
        <Box sx={styles.grid}>
          {quotations.map(quotation => (
            <ProjectQuotationCard
              key={quotation.id}
              quotation={quotation}
              onOpen={() => navigate(buildProjectQuotationPath(quotation), { state: returnState })}
            />
          ))}
        </Box>
      )}
      {quotationsQuery.hasNextPage && (
        <Button
          onClick={loadMore}
          variant={BUTTON_VARIANTS.NEUTRAL}
          text={PROJECT_QUOTATIONS_COPY.LOAD_MORE}
          isLoading={quotationsQuery.isFetchingNextPage}
        />
      )}
    </Box>
  );
};
export default ProjectQuotationsCard;
