import type { FC } from "react";
import AvatarStack from "../../../../components/AvatarStack/AvatarStack";
import { toProjectSummary } from "../../../../utilities/mappers/project.mapper";
import type { IProjectListItem } from "../../../../interfaces/project-list.interface";

interface IProjectTeamCellProps {
  project: IProjectListItem;
}

const ProjectTeamCell: FC<IProjectTeamCellProps> = ({ project }) => (
  <AvatarStack initialsList={toProjectSummary(project).teamInitials} />
);

export default ProjectTeamCell;
