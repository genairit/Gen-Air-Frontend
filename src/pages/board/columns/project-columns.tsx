import ProjectNameCell from "./cells/ProjectNameCell";
import ProjectTeamCell from "./cells/ProjectTeamCell";
import ProjectTypeCell from "./cells/ProjectTypeCell";
import ProjectStageCell from "./cells/ProjectStageCell";
import ProjectUpdatedCell from "./cells/ProjectUpdatedCell";
import { PROJECT_TABLE_HEADERS } from "../../../constants/board.constant";
import type { IDataTableColumn } from "../../../interfaces/data-table.interface";
import type { IProjectListItem } from "../../../interfaces/project-list.interface";
import type { IApiProject, IApiProjectStage } from "../../../interfaces/api.interface";

export const PROJECT_TABLE_MIN_WIDTH = 860;

interface IProjectColumnsOptions {
  canMoveStage: boolean;
  stages: IApiProjectStage[];
  onStageChange: (project: IProjectListItem, stageId: string) => void;
}

export const buildProjectColumns = ({
  stages,
  canMoveStage,
  onStageChange,
}: IProjectColumnsOptions): IDataTableColumn<IApiProject>[] => [
  {
    id: "project",
    track: "minmax(220px, 1.8fr)",
    header: PROJECT_TABLE_HEADERS.PROJECT,
    render: project => <ProjectNameCell project={project} />,
  },
  {
    id: "type",
    track: "minmax(140px, 1fr)",
    header: PROJECT_TABLE_HEADERS.TYPE,
    render: project => <ProjectTypeCell project={project} />,
  },
  {
    id: "team",
    track: "minmax(110px, 0.7fr)",
    header: PROJECT_TABLE_HEADERS.TEAM,
    render: project => <ProjectTeamCell project={project} />,
  },
  {
    id: "updated",
    track: "minmax(100px, 0.6fr)",
    header: PROJECT_TABLE_HEADERS.UPDATED,
    render: project => <ProjectUpdatedCell project={project} />,
  },
  {
    id: "stage",
    track: "minmax(200px, 1.1fr)",
    header: PROJECT_TABLE_HEADERS.STAGE,
    render: project => (
      <ProjectStageCell
        stages={stages}
        project={project}
        canMove={canMoveStage}
        onChange={onStageChange}
      />
    ),
  },
];
