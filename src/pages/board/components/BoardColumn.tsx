import type { FC } from "react";
import { useItemDrop } from "../../../hooks/item-drop.hook";
import { BOARD_COPY } from "../../../constants/board.constant";
import type { IApiProject } from "../../../interfaces/api.interface";
import ProjectCard from "../../../components/ProjectCard/ProjectCard";
import type { TDragSourceProps } from "../../../hooks/drag-source.hook";
import KanbanColumn from "../../../components/KanbanColumn/KanbanColumn";
import type { IBoardColumn } from "../../../interfaces/project.interface";
import { toProjectSummary } from "../../../utilities/mappers/project.mapper";

interface IBoardColumnProps {
  totalCount: number;
  column: IBoardColumn;
  projects: IApiProject[];
  draggingId: string | null;
  onOpenProject: (projectId: string) => void;
  onDropProject: (projectId: string, stageId: string) => void;
  getDragSourceProps: (projectId: string) => TDragSourceProps;
}

const BoardColumn: FC<IBoardColumnProps> = ({
  column,
  projects,
  totalCount,
  draggingId,
  onDropProject,
  onOpenProject,
  getDragSourceProps,
}) => {
  const { isDragOver, dropZoneProps } = useItemDrop(projectId =>
    onDropProject(projectId, column.stageId),
  );

  return (
    <KanbanColumn
      count={totalCount}
      title={column.title}
      isHighlighted={isDragOver}
      dotColor={column.dotColor}
      dropZoneProps={dropZoneProps}
      emptyLabel={BOARD_COPY.EMPTY_COLUMN}
    >
      {projects.map(project => (
        <ProjectCard
          key={project.id}
          onOpen={onOpenProject}
          project={toProjectSummary(project)}
          isDragging={project.id === draggingId}
          dragSourceProps={getDragSourceProps(project.id)}
        />
      ))}
    </KanbanColumn>
  );
};

export default BoardColumn;
