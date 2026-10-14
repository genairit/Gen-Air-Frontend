import { theme } from "../constants/theme.constants";
import type { IStageTile } from "../interfaces/stage-tile.interface";
import { ALL_STAGES_LABEL, ALL_STAGES_TILE_ID } from "../constants/stage-tile.constant";
import type { IApiProjectStage, IProjectStageCounts } from "../interfaces/api.interface";

export const toStageTiles = (
  stages: IApiProjectStage[],
  counts: IProjectStageCounts | null,
): IStageTile[] => [
  {
    id: ALL_STAGES_TILE_ID,
    count: counts?.total ?? 0,
    label: ALL_STAGES_LABEL,
    dotColor: theme.palette.textMuted,
  },
  ...stages.map(stage => ({
    id: stage.id,
    label: stage.name,
    count: counts?.byStage[stage.id] ?? 0,
    dotColor: stage.color ?? theme.palette.statusGray,
  })),
];

export const toStageFilter = (tileId: string) => {
  if (tileId === ALL_STAGES_TILE_ID) {
    return null;
  }

  return tileId;
};

export const toStageShare = (count: number, total: number) => {
  if (total === 0) {
    return 0;
  }

  return count / total;
};

export const countInStageFilter = (counts: IProjectStageCounts | null, stageId: string | null) => {
  if (!stageId) {
    return counts?.total ?? 0;
  }

  return counts?.byStage[stageId] ?? 0;
};
