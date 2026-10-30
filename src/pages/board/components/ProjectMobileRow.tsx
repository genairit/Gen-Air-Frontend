import type { FC } from "react";
import { Box } from "@mui/material";
import Card from "../../../components/Card/Card";
import Chip from "../../../components/Chip/Chip";
import ProjectStageCell from "../columns/cells/ProjectStageCell";
import { PROJECT_COLUMN_STYLES } from "../columns/project-columns.style";
import type { IApiProjectStage } from "../../../interfaces/api.interface";
import { toProjectSummary } from "../../../utilities/mappers/project.mapper";
import type { IProjectListItem } from "../../../interfaces/project-list.interface";

interface IProjectMobileRowProps {
  canMoveStage: boolean;
  project: IProjectListItem;
  stages: IApiProjectStage[];
  onOpen: (projectId: string) => void;
  onStageChange: (project: IProjectListItem, stageId: string) => void;
}

const ProjectMobileRow: FC<IProjectMobileRowProps> = ({
  stages,
  onOpen,
  project,
  canMoveStage,
  onStageChange,
}) => {
  const summary = toProjectSummary(project);

  return (
    <Card gap="10px" padding="16px" onClick={() => onOpen(project.id)}>
      <Box sx={PROJECT_COLUMN_STYLES.mobileHeader}>
        <Box component="b" sx={PROJECT_COLUMN_STYLES.name}>
          {project.name}
        </Box>
        <Box component="span" sx={PROJECT_COLUMN_STYLES.code}>
          {project.code}
        </Box>
      </Box>
      <Box sx={PROJECT_COLUMN_STYLES.mobileMeta}>
        <Box component="span" sx={PROJECT_COLUMN_STYLES.caption}>
          {`${summary.type} · ${summary.updatedLabel}`}
        </Box>
        {summary.apartmentsLabel && <Chip label={summary.apartmentsLabel} />}
      </Box>
      <ProjectStageCell
        stages={stages}
        project={project}
        canMove={canMoveStage}
        onChange={onStageChange}
      />
    </Card>
  );
};

export default ProjectMobileRow;
