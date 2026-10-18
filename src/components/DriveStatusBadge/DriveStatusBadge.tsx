import {
  DRIVE_STATUS_LABELS,
  type DriveStatusBadgeStateType,
} from "../../constants/drive-folder.constant";

import type { FC } from "react";
import { Box } from "@mui/material";
import { useStyles } from "./DriveStatusBadge.style";
import { DRIVE_STATUS_GLYPHS } from "./constants/drive-status-glyphs.constant";

interface IDriveStatusBadgeProps {
  size: number;
  state: DriveStatusBadgeStateType;
}

const DriveStatusBadge: FC<IDriveStatusBadgeProps> = ({ size, state }) => {
  const styles = useStyles();
  const label = DRIVE_STATUS_LABELS[state];
  const Glyph = DRIVE_STATUS_GLYPHS[state];

  return (
    <Box role="img" component="span" sx={styles.badge} aria-label={label}>
      <svg aria-hidden width={size} height={size} viewBox="0 0 20 20">
        <Glyph />
      </svg>
    </Box>
  );
};

export default DriveStatusBadge;
