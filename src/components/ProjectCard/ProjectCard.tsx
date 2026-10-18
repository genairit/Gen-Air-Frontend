import type { FC } from "react";
import Card from "../Card/Card";
import Chip from "../Chip/Chip";
import { Box } from "@mui/material";
import { useStyles } from "./ProjectCard.style";
import ProgressBar from "../ProgressBar/ProgressBar";
import AvatarStack from "../AvatarStack/AvatarStack";
import { CHIP_VARIANTS } from "../../constants/chip.constant";
import { SURFACE_RADII } from "../../constants/surface.constant";
import type { TDragSourceProps } from "../../hooks/drag-source.hook";
import type { IProjectSummary } from "../../interfaces/project.interface";
import { CONTROL_SIZES } from "../../constants/selection-control.constant";

interface IProjectCardProps {
  isDragging?: boolean;
  project: IProjectSummary;
  dragSourceProps?: TDragSourceProps;
  onOpen: (projectId: string) => void;
}

const ProjectCard: FC<IProjectCardProps> = ({
  project,
  onOpen,
  dragSourceProps,
  isDragging = false,
}) => {
  const styles = useStyles();

  return (
    <Box {...dragSourceProps}>
      <Card
        padding="18px"
        radius={SURFACE_RADII.PANEL}
        sx={styles.card({ isDragging })}
        onClick={() => onOpen(project.id)}
      >
        <Box sx={styles.row}>
          <Box sx={styles.chips}>
            <Chip label={project.type} variant={CHIP_VARIANTS.INSET} />
            {project.apartmentsLabel && <Chip label={project.apartmentsLabel} />}
          </Box>
          <Box sx={styles.id} component="span">
            {project.code}
          </Box>
        </Box>
        <Box component="b" sx={styles.name}>
          {project.name}
        </Box>
        {project.progress != null && (
          <ProgressBar value={project.progress} size={CONTROL_SIZES.SMALL} />
        )}
        <Box sx={styles.footer}>
          <AvatarStack initialsList={project.teamInitials} />
          <Box component="span" sx={styles.updated}>
            {project.updatedLabel}
            <Box aria-hidden component="span" sx={styles.chevron}>
              ‹
            </Box>
          </Box>
        </Box>
      </Card>
    </Box>
  );
};

export default ProjectCard;
