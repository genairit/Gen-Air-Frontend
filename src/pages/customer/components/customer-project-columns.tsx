import CustomerProjectNameCell from "./CustomerProjectNameCell";
import CustomerProjectTypeCell from "./CustomerProjectTypeCell";
import ProjectTeamCell from "../../board/columns/cells/ProjectTeamCell";
import { PROJECT_TABLE_HEADERS } from "../../../constants/board.constant";
import ProjectUpdatedCell from "../../board/columns/cells/ProjectUpdatedCell";
import type { IDataTableColumn } from "../../../interfaces/data-table.interface";
import type { ICustomerProjectItem } from "../../../interfaces/customer-project.interface";

export const buildCustomerProjectColumns = (): IDataTableColumn<ICustomerProjectItem>[] => [
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
];
