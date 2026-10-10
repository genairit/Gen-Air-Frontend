import Dot from "../Dot/Dot";
import Card from "../Card/Card";
import Chip from "../Chip/Chip";
import { Box } from "@mui/material";
import { useStyles } from "./KanbanColumn.style";
import { type FC, type ReactNode, Children } from "react";
import { CHIP_VARIANTS } from "../../constants/chip.constant";
import type { TDropZoneProps } from "../../hooks/drop-zone.hook";
import { SURFACE_DEPTHS } from "../../constants/surface.constant";

interface IKanbanColumnProps {
  title: string;
  count: number;
  dotColor: string;
  children: ReactNode;
  emptyLabel?: string;
  isHighlighted?: boolean;
  dropZoneProps?: TDropZoneProps;
}

const KanbanColumn: FC<IKanbanColumnProps> = ({
  title,
  count,
  dotColor,
  children,
  emptyLabel,
  dropZoneProps,
  isHighlighted = false,
}) => {
  const styles = useStyles();
  const isEmpty = Children.count(children) === 0;
  const shouldShowEmptyLabel = isEmpty && Boolean(emptyLabel);

  return (
    <Box {...dropZoneProps}>
      <Card
        gap="16px"
        padding="16px"
        depth={SURFACE_DEPTHS.INSET}
        sx={styles.column({ isHighlighted })}
      >
        <Box sx={styles.header}>
          <Box sx={styles.title}>
            <Dot size={9} color={dotColor} />
            {title}
          </Box>
          <Chip label={String(count)} variant={CHIP_VARIANTS.DARK} />
        </Box>
        {children}
        {shouldShowEmptyLabel && <Box sx={styles.empty}>{emptyLabel}</Box>}
      </Card>
    </Box>
  );
};

export default KanbanColumn;
