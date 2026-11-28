import {
  buildEstimateCreatePath,
  buildEstimateDetailPath,
} from "../../../utilities/engineering-estimate.utility";

import type { FC } from "react";
import { Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import Card from "../../../components/Card/Card";
import { usePageStyles } from "../../page.style";
import Button from "../../../components/Button/Button";
import { useStyles } from "./ProjectEstimatesPanel.style";
import { useSessionUser } from "../../../store/session.store";
import { SURFACE_DEPTHS } from "../../../constants/surface.constant";
import { PERMISSIONS } from "../../../constants/permission.constant";
import { hasPermission } from "../../../utilities/permission.utility";
import InlineError from "../../../components/InlineError/InlineError";
import LoadingState from "../../../components/LoadingState/LoadingState";
import { getApiErrorMessage } from "../../../utilities/api-error.utility";
import { useEstimatesQuery } from "../../../hooks/engineering-estimate.hook";
import { BUTTON_VARIANTS } from "../../../components/Button/constants/button.constants";
import { ESTIMATE_STATUS_LABELS } from "../../../constants/engineering-estimate.constant";

interface IProjectEstimatesPanelProps {
  projectId: string;
}

const ProjectEstimatesPanel: FC<IProjectEstimatesPanelProps> = ({ projectId }) => {
  const styles = useStyles();
  const page = usePageStyles();
  const navigate = useNavigate();
  const sessionUser = useSessionUser();
  const canCreate = hasPermission(sessionUser, PERMISSIONS.ENGINEERING_ESTIMATES_MANAGE);
  const list = useEstimatesQuery(projectId);
  const estimates = list.data?.pages.flatMap(page => page.items) ?? [];

  return (
    <Box sx={page.stack({ gap: "12px" })}>
      {canCreate && (
        <Box sx={page.endRow}>
          <Button
            size="compact"
            text="יצירת כתב כמויות"
            onClick={() => navigate(buildEstimateCreatePath(projectId))}
          />
        </Box>
      )}
      {list.isPending && <LoadingState label="טוען כתבי כמויות..." />}
      {list.isError && (
        <Box sx={page.row({ gap: "8px" })}>
          <InlineError message={getApiErrorMessage(list.error)} />
          {!list.isFetchNextPageError && (
            <Button
              size="compact"
              text="נסו שוב"
              variant={BUTTON_VARIANTS.NEUTRAL}
              onClick={() => {
                void list.refetch();
              }}
            />
          )}
        </Box>
      )}
      {list.isSuccess && estimates.length === 0 && (
        <Box role="status" sx={page.caption}>
          עדיין אין כתבי כמויות בפרויקט זה
        </Box>
      )}
      {estimates.length > 0 && (
        <Box sx={styles.grid}>
          {estimates.map(estimate => (
            <Card
              gap="6px"
              key={estimate.id}
              depth={SURFACE_DEPTHS.INSET}
              onClick={() => navigate(buildEstimateDetailPath(estimate.id))}
              ariaLabel={`${estimate.name} · ${ESTIMATE_STATUS_LABELS[estimate.status]}`}
            >
              <Box component="strong" sx={page.wrappingText}>
                {estimate.name}
              </Box>
              <Box component="span" sx={page.caption}>
                {ESTIMATE_STATUS_LABELS[estimate.status]}
              </Box>
            </Card>
          ))}
        </Box>
      )}
      {list.hasNextPage && (
        <Box sx={page.endRow}>
          <Button
            size="compact"
            variant={BUTTON_VARIANTS.NEUTRAL}
            disabled={list.isFetchingNextPage}
            isLoading={list.isFetchingNextPage}
            onClick={() => {
              void list.fetchNextPage();
            }}
            text={list.isFetchNextPageError ? "נסו שוב" : "טענו עוד"}
          />
        </Box>
      )}
    </Box>
  );
};

export default ProjectEstimatesPanel;
