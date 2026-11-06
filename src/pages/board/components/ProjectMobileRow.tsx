import type { FC } from "react";
import { Box } from "@mui/material";
import Card from "../../../components/Card/Card";
import Chip from "../../../components/Chip/Chip";
import { theme } from "../../../constants/theme.constants";
import { formatStageLabel } from "../../../utilities/text.utility";
import { PROJECT_COLUMN_STYLES } from "../columns/project-columns.style";
import { toProjectSummary } from "../../../utilities/mappers/project.mapper";
import type { IProjectListItem } from "../../../interfaces/project-list.interface";

interface IProjectMobileRowProps {
  project: IProjectListItem;
  onOpen: (projectId: string) => void;
}

const ProjectMobileRow: FC<IProjectMobileRowProps> = ({ onOpen, project }) => {
  const summary = toProjectSummary(project);

  return (
    <Card gap="10px" padding="16px" ariaLabel={project.name} onClick={() => onOpen(project.id)}>
      <Box sx={PROJECT_COLUMN_STYLES.mobileHeader}>
        <Box component="b" sx={PROJECT_COLUMN_STYLES.name}>
          {project.name}
        </Box>
        <Box component="span" sx={PROJECT_COLUMN_STYLES.code}>
          {project.code}
        </Box>
      </Box>
      <Box sx={PROJECT_COLUMN_STYLES.mobileMeta}>
        <Box component="span" sx={PROJECT_COLUMN_STYLES.caption}>
          {`${summary.type} · ${summary.updatedLabel}`}
        </Box>
        {summary.apartmentsLabel && <Chip label={summary.apartmentsLabel} />}
        {project.stage && (
          <Chip
            label={formatStageLabel(project.stage.name)}
            dotColor={project.stage.color ?? theme.palette.statusGray}
          />
        )}
      </Box>
    </Card>
  );
};

export default ProjectMobileRow;
