import CustomerProjectNameCell from "./CustomerProjectNameCell";
import CustomerProjectTypeCell from "./CustomerProjectTypeCell";
import CustomerProjectStageCell from "./CustomerProjectStageCell";
import ProjectTeamCell from "../../board/columns/cells/ProjectTeamCell";
import { PROJECT_TABLE_HEADERS } from "../../../constants/board.constant";
import type { IApiProjectStage } from "../../../interfaces/api.interface";
import ProjectUpdatedCell from "../../board/columns/cells/ProjectUpdatedCell";
import type { IDataTableColumn } from "../../../interfaces/data-table.interface";
import type { IProjectListItem } from "../../../interfaces/project-list.interface";
import type { ICustomerProjectItem } from "../../../interfaces/customer-project.interface";

interface ICustomerProjectColumnOptions {
  canMove: boolean;
  stages: IApiProjectStage[];
  onStageChange: (project: IProjectListItem, stageId: string) => void;
}

export const buildCustomerProjectColumns = ({
  canMove,
  stages,
  onStageChange,
}: ICustomerProjectColumnOptions): IDataTableColumn<ICustomerProjectItem>[] => [
  {
    id: "project",
    header: PROJECT_TABLE_HEADERS.PROJECT,
    track: "minmax(180px, 1.6fr)",
    render: project => <CustomerProjectNameCell project={project} />,
  },
  {
    id: "type",
    header: PROJECT_TABLE_HEADERS.TYPE,
    track: "minmax(230px, 1.8fr)",
    render: project => <CustomerProjectTypeCell project={project} />,
  },
  {
    id: "team",
    header: PROJECT_TABLE_HEADERS.TEAM,
    track: "110px",
    render: project => <ProjectTeamCell project={project} />,
  },
  {
    id: "updated",
    header: PROJECT_TABLE_HEADERS.UPDATED,
    track: "100px",
    render: project => <ProjectUpdatedCell project={project} />,
  },
  {
    id: "stage",
    header: PROJECT_TABLE_HEADERS.STAGE,
    track: "170px",
    render: project => (
      <CustomerProjectStageCell
        stages={stages}
        canMove={canMove}
        project={project}
        onChange={onStageChange}
      />
    ),
  },
];
