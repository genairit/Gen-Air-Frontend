import type { FC } from "react";
import { Box } from "@mui/material";
import { PROJECT_COLUMN_STYLES } from "../project-columns.style";
import type { IApiProject } from "../../../../interfaces/api.interface";
import { formatProjectCustomer } from "../../../../utilities/project.utility";

interface IProjectCustomerCellProps {
  project: IApiProject;
}

const ProjectCustomerCell: FC<IProjectCustomerCellProps> = ({ project }) => (
  <Box component="span" sx={PROJECT_COLUMN_STYLES.text}>
    {formatProjectCustomer(project)}
  </Box>
);

export default ProjectCustomerCell;
