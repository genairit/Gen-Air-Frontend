import type { FC } from "react";
import { Box, Typography } from "@mui/material";
import Card from "../../../components/Card/Card";
import { usePageStyles } from "../../page.style";
import Button from "../../../components/Button/Button";
import { useNavigate, generatePath } from "react-router-dom";
import { useSessionUser } from "../../../store/session.store";
import { ROUTE_PATHS } from "../../../constants/routes.constant";
import { PERMISSIONS } from "../../../constants/permission.constant";
import { hasPermission } from "../../../utilities/permission.utility";
import InlineError from "../../../components/InlineError/InlineError";
import LoadingState from "../../../components/LoadingState/LoadingState";
import { getApiErrorMessage } from "../../../utilities/api-error.utility";
import { formatBoqEstimate } from "../../../utilities/project-boq.utility";
import { usePurchaseDocumentStyles } from "./ProjectPurchaseDocuments.style";
import { PROJECT_PURCHASE_COPY } from "../../../constants/project-purchase.constant";
import { useProjectBoqDocumentsQuery } from "../../../hooks/queries/project-boq.query";

const ProjectPurchaseDocuments: FC<{ projectId: string }> = ({ projectId }) => {
  const styles = usePageStyles();
  const navigate = useNavigate();
  const canCreate = hasPermission(useSessionUser(), PERMISSIONS.PROJECT_BOQ_MANAGE);
  const documentStyles = usePurchaseDocumentStyles();
  const query = useProjectBoqDocumentsQuery(projectId);
  const retry = async () => {
    await query.refetch();
  };

  return (
    <Box sx={styles.stack({ gap: "12px" })}>
      {canCreate && (
        <Box sx={styles.endRow}>
          <Button
            size="compact"
            text="יצירת כתב רכש"
            onClick={() => navigate(generatePath(ROUTE_PATHS.PROJECT_BOQ, { projectId }))}
          />
        </Box>
      )}
      {query.isPending && <LoadingState label={PROJECT_PURCHASE_COPY.LOADING} />}
      {query.isError && (
        <Box>
          <InlineError message={getApiErrorMessage(query.error)} />
          <Button size="compact" onClick={retry} text={PROJECT_PURCHASE_COPY.RETRY} />
        </Box>
      )}
      {query.isSuccess && query.data.length === 0 && (
        <Typography sx={styles.caption}>{PROJECT_PURCHASE_COPY.EMPTY}</Typography>
      )}
      <Box
        component="section"
        aria-label={PROJECT_PURCHASE_COPY.TITLE}
        sx={styles.grid({ minColumnWidth: 280, gap: "16px" })}
      >
        {(query.data ?? []).map(document => (
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
    </Box>
  );
};
export default ProjectPurchaseDocuments;
