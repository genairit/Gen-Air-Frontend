import { Box } from "@mui/material";
import { usePageStyles } from "../page.style";
import Button from "../../components/Button/Button";
import { theme } from "../../constants/theme.constants";
import { useNavigate, useParams } from "react-router-dom";
import DropZone from "../../components/DropZone/DropZone";
import ProjectTeamCard from "./components/ProjectTeamCard";
import { useSessionUser } from "../../store/session.store";
import { ICON_NAMES } from "../../constants/icon.constant";
import ProjectDriveCard from "./components/ProjectDriveCard";
import EmptyState from "../../components/EmptyState/EmptyState";
import { formatStageLabel } from "../../utilities/text.utility";
import ProjectTimelineCard from "./components/ProjectTimelineCard";
import InlineError from "../../components/InlineError/InlineError";
import { hasPermission } from "../../utilities/permission.utility";
import { useProjectQuery } from "../../hooks/queries/project.query";
import { buildEditProjectPath } from "../../utilities/route.utility";
import LoadingState from "../../components/LoadingState/LoadingState";
import { getApiErrorMessage } from "../../utilities/api-error.utility";
import ProjectHeader from "../../components/ProjectHeader/ProjectHeader";
import { toErpSyncCaption } from "../../utilities/mappers/project.mapper";
import { ROUTE_PARAMS, ROUTE_PATHS } from "../../constants/routes.constant";
import { PROJECT_DRIVE_UPLOAD_DESCRIPTION } from "../../constants/project.constant";
import { BUTTON_VARIANTS } from "../../components/Button/constants/button.constants";
import { useUploadProjectFilesMutation } from "../../hooks/mutations/project.mutation";
import { PROJECT_PAGE_COPY, PROJECT_PAGE_STATUS_COPY } from "../../constants/project-page.constant";

const ProjectPage = () => {
  const navigate = useNavigate();
  const styles = usePageStyles();
  const params = useParams();
  const sessionUser = useSessionUser();
  const projectId = params[ROUTE_PARAMS.PROJECT_ID] ?? null;
  const projectQuery = useProjectQuery(projectId);
  const uploadMutation = useUploadProjectFilesMutation();

  if (projectQuery.isPending) {
    return <LoadingState label={PROJECT_PAGE_STATUS_COPY.LOADING} />;
  }

  if (projectQuery.isError) {
    return (
      <EmptyState
        icon={ICON_NAMES.BUILDING}
        title={PROJECT_PAGE_COPY.NOT_FOUND_TITLE}
        description={getApiErrorMessage(projectQuery.error)}
        action={
          <Button
            text={PROJECT_PAGE_COPY.BACK_TO_BOARD}
            variant={BUTTON_VARIANTS.NEUTRAL}
            onClick={() => navigate(ROUTE_PATHS.BOARD)}
          />
        }
      />
    );
  }

  const project = projectQuery.data;

  return (
    <Box sx={styles.page}>
      <ProjectHeader
        title={project.name}
        projectId={project.code}
        icon={ICON_NAMES.BUILDING}
        syncCaption={toErpSyncCaption(project.erpSyncedAt)}
        stage={formatStageLabel(project.stage?.name ?? "")}
        stageDotColor={project.stage?.color ?? theme.palette.orange}
        actions={
          hasPermission(sessionUser, "EDIT_PROJECTS") && (
            <Button
              icon={ICON_NAMES.EDIT}
              text={PROJECT_PAGE_COPY.EDIT}
              variant={BUTTON_VARIANTS.NEUTRAL}
              onClick={() => navigate(buildEditProjectPath(project.id))}
            />
          )
        }
      />

      <ProjectTeamCard members={project.members ?? []} />

      <Box sx={styles.grid({ minColumnWidth: 380 })}>
        <Box sx={styles.stack({})}>
          <ProjectDriveCard projectId={project.id} />
          <DropZone
            title={PROJECT_PAGE_COPY.UPLOAD_TITLE}
            buttonLabel={PROJECT_PAGE_COPY.UPLOAD_BUTTON}
            description={PROJECT_DRIVE_UPLOAD_DESCRIPTION}
            onFilesSelected={files => uploadMutation.mutate({ projectId: project.id, files })}
          />
          {uploadMutation.isPending && <LoadingState label={PROJECT_PAGE_STATUS_COPY.UPLOADING} />}
          {uploadMutation.isError && (
            <InlineError message={getApiErrorMessage(uploadMutation.error)} />
          )}
        </Box>

        <ProjectTimelineCard projectId={project.id} />
      </Box>
    </Box>
  );
};

export default ProjectPage;
