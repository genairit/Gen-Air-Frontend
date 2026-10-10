import type { FC } from "react";
import StatusStageRow from "./StatusStageRow";
import { usePageStyles } from "../../page.style";
import Card from "../../../components/Card/Card";
import Chip from "../../../components/Chip/Chip";
import Button from "../../../components/Button/Button";
import { ICON_NAMES } from "../../../constants/icon.constant";
import { useDragSource } from "../../../hooks/drag-source.hook";
import { CHIP_VARIANTS } from "../../../constants/chip.constant";
import CardHeader from "../../../components/CardHeader/CardHeader";
import { SETTINGS_COPY } from "../../../constants/settings.constant";
import { formatActiveStageCount } from "../../../utilities/text.utility";
import type { IStatusStage } from "../../../interfaces/project.interface";
import { BUTTON_VARIANTS } from "../../../components/Button/constants/button.constants";

interface IStatusStagesCardProps {
  onAdd: () => void;
  isEditable: boolean;
  stages: IStatusStage[];
  onDelete: (stageId: string) => void;
  onMove: (draggedStageId: string, targetStageId: string) => void;
}

const StatusStagesCard: FC<IStatusStagesCardProps> = ({
  stages,
  isEditable,
  onAdd,
  onDelete,
  onMove,
}) => {
  const styles = usePageStyles();
  const { draggingId, getDragSourceProps } = useDragSource();

  return (
    <Card gap="16px">
      <CardHeader
        icon={ICON_NAMES.PROJECTS}
        title={SETTINGS_COPY.STAGES_TITLE}
        subtitle={SETTINGS_COPY.STAGES_SUBTITLE}
        action={
          <Chip variant={CHIP_VARIANTS.INSET} label={formatActiveStageCount(stages.length)} />
        }
      />
      {stages.map((stage, index) => (
        <StatusStageRow
          stage={stage}
          key={stage.id}
          onMove={onMove}
          onDelete={onDelete}
          position={index + 1}
          isEditable={isEditable}
          isDragging={stage.id === draggingId}
          dragSourceProps={getDragSourceProps(stage.id)}
        />
      ))}
      {isEditable && (
        <Button
          onClick={onAdd}
          sx={styles.fullWidth}
          icon={ICON_NAMES.ADD}
          text={SETTINGS_COPY.ADD_STAGE}
          variant={BUTTON_VARIANTS.DASHED}
        />
      )}
    </Card>
  );
};

export default StatusStagesCard;
