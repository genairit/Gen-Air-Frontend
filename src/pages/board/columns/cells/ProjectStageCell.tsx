import { Box } from "@mui/material";
import type { FC, MouseEvent } from "react";
import { PROJECT_COLUMN_STYLES } from "../project-columns.style";
import { findStageByName } from "../../../../utilities/project.utility";
import Autocomplete from "../../../../components/Autocomplete/Autocomplete";
import type { IApiProjectStage } from "../../../../interfaces/api.interface";
import type { IProjectListItem } from "../../../../interfaces/project-list.interface";

interface IProjectStageCellProps {
  canMove: boolean;
  project: IProjectListItem;
  stages: IApiProjectStage[];
  onChange: (project: IProjectListItem, stageId: string) => void;
}

const stopRowClick = (event: MouseEvent) => event.stopPropagation();

const ProjectStageCell: FC<IProjectStageCellProps> = ({ canMove, project, stages, onChange }) => {
  const currentStage = stages.find(stage => stage.id === project.stageId) ?? null;

  const changeStage = (stageName: string | null) => {
    const stage = findStageByName(stages, stageName);

    if (!stage || stage.id === project.stageId) {
      return;
    }

    onChange(project, stage.id);
  };

  return (
    <Box onClick={stopRowClick} sx={PROJECT_COLUMN_STYLES.stopper}>
      <Autocomplete
        disabled={!canMove}
        isAutocomplete={false}
        onChange={changeStage}
        value={currentStage?.name ?? null}
        options={stages.map(stage => stage.name)}
      />
    </Box>
  );
};

export default ProjectStageCell;
