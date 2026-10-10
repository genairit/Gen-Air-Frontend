import { queryClient } from "../providers/query-client";
import { QUERY_KEYS } from "../constants/query-key.constant";
import type { IStatusStage } from "../interfaces/project.interface";
import { getRemovedStageIds } from "../utilities/status-stage.utility";
import { projectStageService } from "../services/project-stage.service";

interface IStageChanges {
  savedStages: IStatusStage[];
  draftStages: IStatusStage[];
}

const resolveStageId = async (stage: IStatusStage) => {
  if (!stage.isDraft) {
    return stage.id;
  }

  const createdStage = await projectStageService.create(stage);

  return createdStage.id;
};

export const saveStageChangesAction = async ({ savedStages, draftStages }: IStageChanges) => {
  try {
    for (const stageId of getRemovedStageIds(savedStages, draftStages)) {
      await projectStageService.delete(stageId);
    }

    const orderedStageIds: string[] = [];

    for (const stage of draftStages) {
      orderedStageIds.push(await resolveStageId(stage));
    }

    await projectStageService.reorder(orderedStageIds);
  } finally {
    await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PROJECT_STAGES });
  }
};
