import type { FC } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../../components/Button/Button";
import WaitingReasonBanner from "./WaitingReasonBanner";
import ProjectStageSelector from "./ProjectStageSelector";
import { theme } from "../../../constants/theme.constants";
import { ICON_NAMES } from "../../../constants/icon.constant";
import { useSessionUser } from "../../../store/session.store";
import { formatStageLabel } from "../../../utilities/text.utility";
import { PERMISSIONS } from "../../../constants/permission.constant";
import type { IApiProject } from "../../../interfaces/api.interface";
import { hasPermission } from "../../../utilities/permission.utility";
import { buildEditProjectPath } from "../../../utilities/route.utility";
import ProjectHeader from "../../../components/ProjectHeader/ProjectHeader";
import { PROJECT_PAGE_COPY } from "../../../constants/project-page.constant";
import { isWaitingForResponseStage } from "../../../utilities/stage-reason.utility";
import { BUTTON_VARIANTS } from "../../../components/Button/constants/button.constants";

interface IProjectPageHeaderProps {
  project: IApiProject;
}

const ProjectPageHeader: FC<IProjectPageHeaderProps> = ({ project }) => {
  const navigate = useNavigate();
  const sessionUser = useSessionUser();
  const canEdit = hasPermission(sessionUser, PERMISSIONS.PROJECTS_UPDATE);
  const canChangeStage = hasPermission(sessionUser, PERMISSIONS.PROJECTS_STATUS_CHANGE);
  const stageControl = canChangeStage ? <ProjectStageSelector project={project} /> : null;
  const stageNote = isWaitingForResponseStage(project.stageId) ? (
    <WaitingReasonBanner project={project} />
  ) : null;

  return (
    <ProjectHeader
      title={project.name}
      stageNote={stageNote}
      projectId={project.code}
      stageControl={stageControl}
      stage={formatStageLabel(project.stage?.name ?? "")}
      stageDotColor={project.stage?.color ?? theme.palette.primary}
      actions={
        <>
          {canEdit && (
            <Button
              icon={ICON_NAMES.EDIT}
              size="compact"
              text={PROJECT_PAGE_COPY.EDIT}
              variant={BUTTON_VARIANTS.NEUTRAL}
              onClick={() => navigate(buildEditProjectPath(project.id))}
            />
          )}
        </>
      }
    />
  );
};

export default ProjectPageHeader;
