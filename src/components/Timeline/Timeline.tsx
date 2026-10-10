import type { FC } from "react";
import { Box } from "@mui/material";
import TimelineItem from "./TimelineItem";
import { useStyles } from "./Timeline.style";
import type { ITimelineEntry } from "../../interfaces/project.interface";

interface ITimelineProps {
  entries: ITimelineEntry[];
}

const Timeline: FC<ITimelineProps> = ({ entries }) => {
  const styles = useStyles();
  const lastIndex = entries.length - 1;

  return (
    <Box component="ol" sx={styles.list}>
      {entries.map((entry, index) => (
        <TimelineItem entry={entry} key={entry.id} isLast={index === lastIndex} />
      ))}
    </Box>
  );
};

export default Timeline;
