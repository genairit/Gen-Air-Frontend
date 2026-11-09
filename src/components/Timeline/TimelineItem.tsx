import Dot from "../Dot/Dot";
import type { FC } from "react";
import Chip from "../Chip/Chip";
import { Box } from "@mui/material";
import { useStyles } from "./TimelineItem.style";
import type { ITimelineEntry } from "../../interfaces/project.interface";
import { STAGE_REASON_COPY } from "../../constants/project-stage.constant";
import { CHIP_VARIANTS, type ChipVariantType } from "../../constants/chip.constant";

interface ITimelineItemProps {
  isLast: boolean;
  entry: ITimelineEntry;
}

const getChipVariant = (isHighlighted?: boolean): ChipVariantType =>
  isHighlighted ? CHIP_VARIANTS.INFO : CHIP_VARIANTS.PLAIN;

const TimelineItem: FC<ITimelineItemProps> = ({ entry, isLast }) => {
  const styles = useStyles();

  return (
    <Box component="li" sx={styles.item}>
      <Box sx={styles.rail}>
        <Box sx={styles.marker}>
          <Dot size={8} color={entry.dotColor} />
        </Box>
        {!isLast && <Box sx={styles.line} />}
      </Box>
      <Box sx={styles.content}>
        <Box sx={styles.header}>
          {entry.badge ?? (
            <Chip label={entry.label} variant={getChipVariant(entry.isHighlighted)} />
          )}
          <Box component="span" sx={styles.date}>
            {entry.date}
          </Box>
        </Box>
        {entry.note && (
          <Box sx={styles.note}>
            <Box component="span" sx={styles.noteLabel}>
              {STAGE_REASON_COPY.TIMELINE_LABEL}
            </Box>
            <Box component="bdi" sx={styles.noteText}>
              {entry.note}
            </Box>
          </Box>
        )}
        <Box component="span" sx={styles.author}>
          {entry.author}
        </Box>
      </Box>
    </Box>
  );
};

export default TimelineItem;
