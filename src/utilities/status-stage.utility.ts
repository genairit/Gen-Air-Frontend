import { moveItem } from "./array.utility";
import type { IStatusStage } from "../interfaces/project.interface";
import { NEW_STATUS_STAGE_TEMPLATE } from "../constants/settings.constant";

export const appendStatusStage = (stages: IStatusStage[]) => [
  ...stages,
  { ...NEW_STATUS_STAGE_TEMPLATE, id: crypto.randomUUID(), isDraft: true },
];

export const removeStatusStage = (stages: IStatusStage[], stageId: string) =>
  stages.filter(stage => stage.id !== stageId);

export const moveStatusStage = (
  stages: IStatusStage[],
  { draggedStageId, targetStageId }: { draggedStageId: string; targetStageId: string },
) => {
  const fromIndex = stages.findIndex(stage => stage.id === draggedStageId);
  const toIndex = stages.findIndex(stage => stage.id === targetStageId);
  const isStageMissing = fromIndex < 0 || toIndex < 0;
  const isSamePosition = fromIndex === toIndex;

  if (isStageMissing || isSamePosition) {
    return stages;
  }

  return moveItem(stages, fromIndex, toIndex);
};

export const getRemovedStageIds = (savedStages: IStatusStage[], draftStages: IStatusStage[]) => {
  const draftIds = new Set(draftStages.map(stage => stage.id));

  return savedStages.filter(stage => !draftIds.has(stage.id)).map(stage => stage.id);
};

export const isSameStageList = (savedStages: IStatusStage[], draftStages: IStatusStage[]) => {
  const hasSameLength = savedStages.length === draftStages.length;
  const hasSameOrder = savedStages.every((stage, index) => stage.id === draftStages[index]?.id);

  return hasSameLength && hasSameOrder;
};
