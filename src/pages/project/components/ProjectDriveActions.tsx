import {
  DRIVE_FOLDER_COPY,
  DRIVE_STATUS_LABELS,
  DRIVE_STATUS_BADGE_SIZES,
  type DriveStatusBadgeStateType,
} from "../../../constants/drive-folder.constant";

import type { FC } from "react";
import { Box } from "@mui/material";
import Icon from "../../../components/Icon/Icon";
import { useStyles } from "./ProjectDriveActions.style";
import { ICON_NAMES } from "../../../constants/icon.constant";
import { toDriveFolderUrl } from "../../../utilities/drive-folder.utility";
import DriveStatusBadge from "../../../components/DriveStatusBadge/DriveStatusBadge";

interface IProjectDriveActionsProps {
  folderId: string;
  state: DriveStatusBadgeStateType;
}

const ProjectDriveActions: FC<IProjectDriveActionsProps> = ({ state, folderId }) => {
  const styles = useStyles();
  return (
    <Box sx={styles.actions}>
      <Box sx={styles.status}>
        <DriveStatusBadge state={state} size={DRIVE_STATUS_BADGE_SIZES.CARD} />
        <Box component="span">{DRIVE_STATUS_LABELS[state]}</Box>
      </Box>
      <Box
        component="a"
        target="_blank"
        sx={styles.link}
        rel="noopener noreferrer"
        href={toDriveFolderUrl(folderId)}
      >
        {DRIVE_FOLDER_COPY.OPEN_FOLDER}
        <Icon size={18} name={ICON_NAMES.OPEN} />
      </Box>
    </Box>
  );
};

export default ProjectDriveActions;
