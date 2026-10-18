import type { FC } from "react";
import Chip from "../../../../components/Chip/Chip";
import { theme } from "../../../../constants/theme.constants";
import { findStage } from "../../../../utilities/apartment.utility";
import type { IApiProject, IApiProjectStage } from "../../../../interfaces/api.interface";

interface IApartmentStageChipProps {
  apartment: IApiProject;
  stages: IApiProjectStage[];
}

const ApartmentStageChip: FC<IApartmentStageChipProps> = ({ stages, apartment }) => {
  const stage = findStage(stages, apartment.stageId);

  return <Chip label={stage?.name ?? ""} dotColor={stage?.color ?? theme.palette.statusGray} />;
};

export default ApartmentStageChip;
