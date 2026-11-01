import type { FC } from "react";
import { Box } from "@mui/material";
import Chip from "../../../../components/Chip/Chip";
import { PROJECT_COLUMN_STYLES } from "../project-columns.style";
import { toProjectSummary } from "../../../../utilities/mappers/project.mapper";
import type { IProjectListItem } from "../../../../interfaces/project-list.interface";

interface IProjectTypeCellProps {
  project: IProjectListItem;
}

const ProjectTypeCell: FC<IProjectTypeCellProps> = ({ project }) => {
  const { type, apartmentsLabel } = toProjectSummary(project);

  return (
    <Box sx={PROJECT_COLUMN_STYLES.cell}>
      <Box component="span" sx={PROJECT_COLUMN_STYLES.text}>
        {type}
      </Box>
      {apartmentsLabel && <Chip label={apartmentsLabel} />}
    </Box>
  );
};

export default ProjectTypeCell;
