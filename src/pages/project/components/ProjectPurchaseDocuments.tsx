import type { FC } from "react";
import { Box, Typography } from "@mui/material";
import Card from "../../../components/Card/Card";
import { usePageStyles } from "../../page.style";
import Button from "../../../components/Button/Button";
import InlineError from "../../../components/InlineError/InlineError";
import LoadingState from "../../../components/LoadingState/LoadingState";
import { getApiErrorMessage } from "../../../utilities/api-error.utility";
import { formatBoqEstimate } from "../../../utilities/project-boq.utility";
import { usePurchaseDocumentStyles } from "./ProjectPurchaseDocuments.style";
import { PROJECT_PURCHASE_COPY } from "../../../constants/project-purchase.constant";
import { useProjectBoqDocumentsQuery } from "../../../hooks/queries/project-boq.query";
import { BUTTON_VARIANTS } from "../../../components/Button/constants/button.constants";

const ProjectPurchaseDocuments: FC<{ projectId: string }> = ({ projectId }) => {
  const styles = usePageStyles();
  const documentStyles = usePurchaseDocumentStyles();
  const query = useProjectBoqDocumentsQuery(projectId);
  const retry = async () => {
    await query.refetch();
  };

  if (query.isPending) {
    return <LoadingState label={PROJECT_PURCHASE_COPY.LOADING} />;
  }

  if (query.isError) {
    return (
      <>
        <InlineError message={getApiErrorMessage(query.error)} />
        <Button
          onClick={retry}
          variant={BUTTON_VARIANTS.NEUTRAL}
          text={PROJECT_PURCHASE_COPY.RETRY}
        />
      </>
    );
  }

  if (query.data.length === 0) {
    return <Typography sx={styles.caption}>{PROJECT_PURCHASE_COPY.EMPTY}</Typography>;
  }

  return (
    <Box
      component="section"
      aria-label={PROJECT_PURCHASE_COPY.TITLE}
      sx={styles.grid({ minColumnWidth: 280, gap: "16px" })}
    >
      {query.data.map(document => (
        <Card key={document.id}>
          <Typography component="h3" sx={documentStyles.name}>
            {document.name}
          </Typography>
          <Typography sx={styles.caption}>
            {PROJECT_PURCHASE_COPY.COST} ·{" "}
            <Box component="bdi">{formatBoqEstimate(document.estimatedTotal)}</Box>
          </Typography>
        </Card>
      ))}
    </Box>
  );
};
export default ProjectPurchaseDocuments;
