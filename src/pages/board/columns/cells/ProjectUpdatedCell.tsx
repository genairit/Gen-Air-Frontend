import type { FC } from "react";
import { Box } from "@mui/material";
import { PROJECT_COLUMN_STYLES } from "../project-columns.style";
import type { IApiProject } from "../../../../interfaces/api.interface";
import { toProjectSummary } from "../../../../utilities/mappers/project.mapper";

interface IProjectUpdatedCellProps {
  project: IApiProject;
}

const ProjectUpdatedCell: FC<IProjectUpdatedCellProps> = ({ project }) => (
  <Box component="span" sx={PROJECT_COLUMN_STYLES.caption}>
    {toProjectSummary(project).updatedLabel}
  </Box>
);

export default ProjectUpdatedCell;
