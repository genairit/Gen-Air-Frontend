import ProjectNameCell from "./cells/ProjectNameCell";
import ProjectTeamCell from "./cells/ProjectTeamCell";
import ProjectTypeCell from "./cells/ProjectTypeCell";
import ProjectUpdatedCell from "./cells/ProjectUpdatedCell";
import type { IApiProject } from "../../../interfaces/api.interface";
import { PROJECT_TABLE_HEADERS } from "../../../constants/board.constant";
import type { IDataTableColumn } from "../../../interfaces/data-table.interface";

export const PROJECT_TABLE_MIN_WIDTH = 680;

export const buildProjectColumns = (): IDataTableColumn<IApiProject>[] => [
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
];
