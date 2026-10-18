import Card from "../Card/Card";
import Chip from "../Chip/Chip";
import { Box } from "@mui/material";
import type { FC, ReactNode } from "react";
import { useStyles } from "./StageListItem.style";
import type { TDropZoneProps } from "../../hooks/drop-zone.hook";
import { toTwoDigitOrdinal } from "../../utilities/number.utility";
import type { TDragSourceProps } from "../../hooks/drag-source.hook";
import { SURFACE_DEPTHS, SURFACE_RADII } from "../../constants/surface.constant";

interface IStageListItemProps {
  tag?: string;
  name: string;
  position: number;
  action?: ReactNode;
  isDragging?: boolean;
  description?: string;
  isHighlighted?: boolean;
  dropZoneProps?: TDropZoneProps;
  dragSourceProps?: TDragSourceProps;
}

const StageListItem: FC<IStageListItemProps> = ({
  tag,
  name,
  action,
  position,
  description,
  dropZoneProps,
  dragSourceProps,
  isDragging = false,
  isHighlighted = false,
}) => {
  const styles = useStyles();

  return (
    <Box {...dragSourceProps} {...dropZoneProps}>
      <Card
        gap="14px"
        padding="14px 16px"
        radius={SURFACE_RADII.PANEL}
        depth={SURFACE_DEPTHS.RAISED_SOFT}
        sx={styles.card({ isDragging, isHighlighted })}
      >
        {dragSourceProps && (
          <Box aria-hidden component="span" sx={styles.handle}>
            ⋮⋮
          </Box>
        )}
        <Box sx={styles.position}>{toTwoDigitOrdinal(position)}</Box>
        <Box sx={styles.details}>
          <Box component="b" sx={styles.name}>
            {name}
          </Box>
          {description && (
            <Box component="span" sx={styles.description}>
              {description}
            </Box>
          )}
        </Box>
        {tag && <Chip label={tag} />}
        {action}
      </Card>
    </Box>
  );
};

export default StageListItem;
