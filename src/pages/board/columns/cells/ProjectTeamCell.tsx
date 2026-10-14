import type { FC } from "react";
import type { IApiProject } from "../../../../interfaces/api.interface";
import AvatarStack from "../../../../components/AvatarStack/AvatarStack";
import { toProjectSummary } from "../../../../utilities/mappers/project.mapper";

interface IProjectTeamCellProps {
  project: IApiProject;
}

const ProjectTeamCell: FC<IProjectTeamCellProps> = ({ project }) => (
  <AvatarStack initialsList={toProjectSummary(project).teamInitials} />
);

export default ProjectTeamCell;
