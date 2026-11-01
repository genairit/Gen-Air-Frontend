import type { FC } from "react";
import { Box } from "@mui/material";
import { PROJECT_COLUMN_STYLES } from "../project-columns.style";
import { toProjectSummary } from "../../../../utilities/mappers/project.mapper";
import type { IProjectListItem } from "../../../../interfaces/project-list.interface";

interface IProjectUpdatedCellProps {
  project: IProjectListItem;
}

const ProjectUpdatedCell: FC<IProjectUpdatedCellProps> = ({ project }) => (
  <Box component="span" sx={PROJECT_COLUMN_STYLES.caption}>
    {toProjectSummary(project).updatedLabel}
  </Box>
);

export default ProjectUpdatedCell;
