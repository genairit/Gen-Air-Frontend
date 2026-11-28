import {
  buildEstimateDetailPath,
  buildProjectEstimatesPath,
} from "../../utilities/engineering-estimate.utility";

import {
  ESTIMATE_PARAM,
  ESTIMATE_CREATE_PROJECT_PARAM,
} from "../../constants/engineering-estimate.constant";

import { useState, type FC } from "react";
import { usePageStyles } from "../page.style";
import { Box, Typography } from "@mui/material";
import Button from "../../components/Button/Button";
import EstimateJenny from "./components/EstimateJenny";
import { useSessionUser } from "../../store/session.store";
import { ROUTE_PATHS } from "../../constants/routes.constant";
import EstimateWorkspace from "./components/EstimateWorkspace";
import EstimateCreateForm from "./components/EstimateCreateForm";
import { useEstimateStyles } from "./engineering-estimates.style";
import { PERMISSIONS } from "../../constants/permission.constant";
import InlineError from "../../components/InlineError/InlineError";
import { hasPermission } from "../../utilities/permission.utility";
import LoadingState from "../../components/LoadingState/LoadingState";
import { getApiErrorMessage } from "../../utilities/api-error.utility";
import { useEstimateQuery } from "../../hooks/engineering-estimate.hook";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { BUTTON_VARIANTS } from "../../components/Button/constants/button.constants";
import type { IEngineeringEstimate } from "../../interfaces/engineering-estimate.interface";
import { WorkspaceToolbarContext } from "../../components/ProjectWorkspace/WorkspaceToolbar.context";

const EngineeringEstimatesPage: FC = () => {
  const styles = usePageStyles();
  const estimateStyles = useEstimateStyles();
  const user = useSessionUser();
  const navigate = useNavigate();
  const [toolbar, setToolbar] = useState<HTMLElement | null>(null);
  const [editing, setEditing] = useState(false);
  const [creatingDirty, setCreatingDirty] = useState(false);
  const [params] = useSearchParams();
  const estimateId = params.get(ESTIMATE_PARAM);
  const createProjectId = estimateId ? null : params.get(ESTIMATE_CREATE_PROJECT_PARAM);
  const detail = useEstimateQuery(estimateId);
  const estimate = detail.data;
  const canEdit = hasPermission(user, PERMISSIONS.ENGINEERING_ESTIMATES_MANAGE);
  const canBrowse = hasPermission(user, PERMISSIONS.DRIVE_READ);
  const canCreate = canEdit && hasPermission(user, PERMISSIONS.PROJECTS_READ);
  const projectId = estimate?.projectId ?? createProjectId;
  const backPath = projectId ? buildProjectEstimatesPath(projectId) : ROUTE_PATHS.BOARD;
  const showLoading = Boolean(estimateId) && detail.isPending;
  const showError = Boolean(estimateId) && detail.isError;
  const showJenny = canEdit && Boolean(createProjectId || estimate);
  const retry = async (): Promise<void> => {
    await detail.refetch();
  };
  const cancelCreate = (): void => {
    navigate(backPath, { replace: true, state: { focusEstimateCreate: true } });
  };
  const openCreated = (created: IEngineeringEstimate): void => {
    navigate(buildEstimateDetailPath(created.id), { replace: true });
  };

  if (!estimateId && !(createProjectId && canCreate)) {
    return <Navigate replace to={backPath} />;
  }

  return (
    <Box sx={styles.page}>
      <Box sx={styles.header}>
        <Typography component="h1" sx={estimateStyles.title}>
          {createProjectId ? "כתב כמויות חדש" : (estimate?.name ?? "כתב כמויות")}
        </Typography>
        {estimateId && (
          <Box ref={setToolbar} sx={estimateStyles.headerActions}>
            <Button
              onClick={() => navigate(backPath)}
              variant={BUTTON_VARIANTS.SECONDARY}
              text={projectId ? "חזרה לכתבי הכמויות בפרויקט" : "חזרה לתיקים"}
            />
          </Box>
        )}
      </Box>
      {createProjectId && (
        <EstimateCreateForm
          key={createProjectId}
          onCreated={openCreated}
          onCancel={cancelCreate}
          projectId={createProjectId}
          onDirtyChange={setCreatingDirty}
        />
      )}
      {showLoading && <LoadingState />}
      {showError && (
        <Box sx={styles.stack({ gap: "12px" })}>
          <InlineError message={getApiErrorMessage(detail.error)} />
          <Button text="נסו שוב" onClick={retry} />
        </Box>
      )}
      {estimate && (
        <WorkspaceToolbarContext.Provider value={toolbar}>
          <EstimateWorkspace
            key={estimate.id}
            canEdit={canEdit}
            estimate={estimate}
            onEditingChange={setEditing}
            canExportToDrive={
              canEdit &&
              hasPermission(user, PERMISSIONS.DRIVE_UPLOAD) &&
              hasPermission(user, PERMISSIONS.PROJECTS_READ)
            }
          />
        </WorkspaceToolbarContext.Provider>
      )}
      {showJenny && (
        <EstimateJenny
          projectId={projectId}
          canBrowse={canBrowse}
          onCreated={openCreated}
          estimate={estimate ?? null}
          suspended={creatingDirty || editing}
        />
      )}
    </Box>
  );
};

export default EngineeringEstimatesPage;
