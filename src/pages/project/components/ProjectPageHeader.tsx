import type { FC, ReactNode } from "react";
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
import { toErpSyncCaption } from "../../../utilities/mappers/project.mapper";
import { PROJECT_PAGE_COPY } from "../../../constants/project-page.constant";
import { isWaitingForResponseStage } from "../../../utilities/stage-reason.utility";
import { BUTTON_VARIANTS } from "../../../components/Button/constants/button.constants";

interface IProjectPageHeaderProps {
  badge?: ReactNode;
  project: IApiProject;
  extraActions?: ReactNode;
}

const ProjectPageHeader: FC<IProjectPageHeaderProps> = ({ badge, project, extraActions }) => {
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
      badge={badge}
      title={project.name}
      stageNote={stageNote}
      projectId={project.code}
      icon={ICON_NAMES.BUILDING}
      stageControl={stageControl}
      stage={formatStageLabel(project.stage?.name ?? "")}
      syncCaption={toErpSyncCaption(project.prioritySyncedAt)}
      stageDotColor={project.stage?.color ?? theme.palette.primary}
      actions={
        <>
          {canEdit && (
            <Button
              icon={ICON_NAMES.EDIT}
              text={PROJECT_PAGE_COPY.EDIT}
              variant={BUTTON_VARIANTS.NEUTRAL}
              onClick={() => navigate(buildEditProjectPath(project.id))}
            />
          )}
          {extraActions}
        </>
      }
    />
  );
};

export default ProjectPageHeader;
