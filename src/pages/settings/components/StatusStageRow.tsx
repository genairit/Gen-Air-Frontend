import {
  BUTTON_SIZES,
  BUTTON_SHAPES,
  BUTTON_VARIANTS,
} from "../../../components/Button/constants/button.constants";

import type { FC } from "react";
import Button from "../../../components/Button/Button";
import { useItemDrop } from "../../../hooks/item-drop.hook";
import { ICON_NAMES } from "../../../constants/icon.constant";
import { SETTINGS_COPY } from "../../../constants/settings.constant";
import type { TDragSourceProps } from "../../../hooks/drag-source.hook";
import type { IStatusStage } from "../../../interfaces/project.interface";
import StageListItem from "../../../components/StageListItem/StageListItem";

interface IStatusStageRowProps {
  position: number;
  stage: IStatusStage;
  isEditable: boolean;
  isDragging: boolean;
  dragSourceProps: TDragSourceProps;
  onDelete: (stageId: string) => void;
  onMove: (draggedStageId: string, targetStageId: string) => void;
}

const StatusStageRow: FC<IStatusStageRowProps> = ({
  stage,
  onMove,
  position,
  onDelete,
  isEditable,
  isDragging,
  dragSourceProps,
}) => {
  const { isDragOver, dropZoneProps } = useItemDrop(draggedStageId =>
    onMove(draggedStageId, stage.id),
  );

  if (!isEditable) {
    return <StageListItem name={stage.name} position={position} />;
  }

  return (
    <StageListItem
      name={stage.name}
      position={position}
      isDragging={isDragging}
      dropZoneProps={dropZoneProps}
      dragSourceProps={dragSourceProps}
      isHighlighted={isDragOver && !isDragging}
      action={
        <Button
          icon={ICON_NAMES.DELETE}
          shape={BUTTON_SHAPES.CIRCLE}
          size={BUTTON_SIZES.COMPACT}
          variant={BUTTON_VARIANTS.NEUTRAL}
          onClick={() => onDelete(stage.id)}
          ariaLabel={SETTINGS_COPY.DELETE_STAGE}
        />
      }
    />
  );
};

export default StatusStageRow;
