import type { FC } from "react";
import Card from "../../../components/Card/Card";
import Chip from "../../../components/Chip/Chip";
import { ICON_NAMES } from "../../../constants/icon.constant";
import { CHIP_VARIANTS } from "../../../constants/chip.constant";
import CardHeader from "../../../components/CardHeader/CardHeader";
import { SETTINGS_COPY } from "../../../constants/settings.constant";
import { formatActiveStageCount } from "../../../utilities/text.utility";
import type { IStatusStage } from "../../../interfaces/project.interface";
import StageListItem from "../../../components/StageListItem/StageListItem";

interface IStatusStagesCardProps {
  stages: IStatusStage[];
}
const StatusStagesCard: FC<IStatusStagesCardProps> = ({ stages }) => (
  <Card gap="16px">
    <CardHeader
      icon={ICON_NAMES.PROJECTS}
      title={SETTINGS_COPY.STAGES_TITLE}
      subtitle={SETTINGS_COPY.STAGES_SUBTITLE}
      action={<Chip variant={CHIP_VARIANTS.INSET} label={formatActiveStageCount(stages.length)} />}
    />
    {stages.map((stage, index) => (
      <StageListItem key={stage.id} name={stage.name} position={index + 1} />
    ))}
  </Card>
);
export default StatusStagesCard;
