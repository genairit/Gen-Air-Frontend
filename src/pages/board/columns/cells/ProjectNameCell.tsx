import type { FC } from "react";
import { Box } from "@mui/material";
import { PROJECT_COLUMN_STYLES } from "../project-columns.style";
import type { IApiProject } from "../../../../interfaces/api.interface";

interface IProjectNameCellProps {
  project: IApiProject;
}

const ProjectNameCell: FC<IProjectNameCellProps> = ({ project }) => (
  <Box sx={PROJECT_COLUMN_STYLES.cell}>
    <Box component="b" sx={PROJECT_COLUMN_STYLES.name}>
      {project.name}
    </Box>
    <Box component="span" sx={PROJECT_COLUMN_STYLES.code}>
      {project.code}
    </Box>
  </Box>
);

export default ProjectNameCell;
