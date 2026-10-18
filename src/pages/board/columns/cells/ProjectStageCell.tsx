import { Box } from "@mui/material";
import type { FC, MouseEvent } from "react";
import { PROJECT_COLUMN_STYLES } from "../project-columns.style";
import { findStageByName } from "../../../../utilities/project.utility";
import Autocomplete from "../../../../components/Autocomplete/Autocomplete";
import type { IApiProject, IApiProjectStage } from "../../../../interfaces/api.interface";

interface IProjectStageCellProps {
  project: IApiProject;
  stages: IApiProjectStage[];
  onChange: (project: IApiProject, stageId: string) => void;
}

const stopRowClick = (event: MouseEvent) => event.stopPropagation();

const ProjectStageCell: FC<IProjectStageCellProps> = ({ project, stages, onChange }) => {
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
        isAutocomplete={false}
        onChange={changeStage}
        value={currentStage?.name ?? null}
        options={stages.map(stage => stage.name)}
      />
    </Box>
  );
};

export default ProjectStageCell;
