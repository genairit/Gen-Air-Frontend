import type { FC } from "react";
import { Box } from "@mui/material";
import { findStageByName } from "../../../utilities/project.utility";
import type { IApiProject } from "../../../interfaces/api.interface";
import InlineError from "../../../components/InlineError/InlineError";
import Autocomplete from "../../../components/Autocomplete/Autocomplete";
import { getApiErrorMessage } from "../../../utilities/api-error.utility";
import { PROJECT_PAGE_COPY } from "../../../constants/project-page.constant";
import { useProjectStagesQuery } from "../../../hooks/queries/project.query";
import { PROJECT_STAGE_SELECTOR_STYLES } from "./ProjectStageSelector.style";
import { useMoveProjectStageMutation } from "../../../hooks/mutations/project.mutation";

interface IProjectStageSelectorProps {
  project: IApiProject;
}

const ProjectStageSelector: FC<IProjectStageSelectorProps> = ({ project }) => {
  const stagesQuery = useProjectStagesQuery();
  const moveMutation = useMoveProjectStageMutation();
  const stages = stagesQuery.data ?? [];
  const error = stagesQuery.error ?? moveMutation.error;
  const stageOptions = stages.map(stage => stage.name);
  const isStageLocked = !stagesQuery.isSuccess || moveMutation.isPending;

  const changeStage = (stageName: string | null) => {
    const stage = findStageByName(stages, stageName);

    if (!stage || stage.id === project.stageId || moveMutation.isPending) {
      return;
    }

    moveMutation.mutate({ projectId: project.id, stageId: stage.id });
  };

  return (
    <Box sx={PROJECT_STAGE_SELECTOR_STYLES.control}>
      <Autocomplete
        isAutocomplete={false}
        onChange={changeStage}
        options={stageOptions}
        disabled={isStageLocked}
        value={project.stage?.name ?? null}
        title={PROJECT_PAGE_COPY.STAGE_TITLE}
      />
      {error && <InlineError message={getApiErrorMessage(error)} />}
    </Box>
  );
};

export default ProjectStageSelector;
