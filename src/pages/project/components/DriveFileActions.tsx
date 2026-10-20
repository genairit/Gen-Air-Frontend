import {
  DRIVE_FILE_COPY,
  ROOT_DRIVE_LOCATION,
  DRIVE_FILE_OPERATIONS,
  type DriveFileOperationType,
} from "../../../constants/drive-file.constant";

import {
  useMoveProjectDriveFileMutation,
  useTrashProjectDriveFileMutation,
} from "../../../hooks/mutations/project.mutation";

import { Box } from "@mui/material";
import DriveTrashDialog from "./DriveTrashDialog";
import DriveFolderDialog from "./DriveFolderDialog";
import { useStyles } from "./DriveFileManager.style";
import Button from "../../../components/Button/Button";
import { type FC, type ReactNode, useState } from "react";
import { useSessionUser } from "../../../store/session.store";
import { hasPermission } from "../../../utilities/permission.utility";
import type { IProjectFile } from "../../../interfaces/project.interface";
import type { IDriveFolderLocation } from "../../../interfaces/drive-file.interface";
import { BUTTON_VARIANTS } from "../../../components/Button/constants/button.constants";

interface IDriveFileActionsProps {
  projectId: string;
  folderName: string;
  file: IProjectFile;
}

const DriveFileActions: FC<IDriveFileActionsProps> = ({ file, projectId, folderName }) => {
  const moveLabel = `${DRIVE_FILE_COPY.MOVE} ${file.name}`;
  const deleteLabel = `${DRIVE_FILE_COPY.DELETE} ${file.name}`;
  const moveTitle = `${DRIVE_FILE_COPY.MOVE_TITLE}: ${file.name}`;
  const currentFolder = `${DRIVE_FILE_COPY.CURRENT_FOLDER}: ${folderName}`;
  const styles = useStyles();
  const user = useSessionUser();
  const [operation, setOperation] = useState<DriveFileOperationType | null>(null);
  const move = useMoveProjectDriveFileMutation();
  const trash = useTrashProjectDriveFileMutation();
  const canManage = hasPermission(user, "EDIT_PROJECTS");
  const moveError = move.isError ? DRIVE_FILE_COPY.ACTION_ERROR : null;
  const close = () => setOperation(null);
  const openMove = () => {
    move.reset();
    setOperation(DRIVE_FILE_OPERATIONS.MOVE);
  };
  const openTrash = () => {
    trash.reset();
    setOperation(DRIVE_FILE_OPERATIONS.TRASH);
  };
  const confirmMove = (path: IDriveFolderLocation[]) =>
    move.mutate(
      { projectId, fileId: file.id, folderId: (path.at(-1) ?? ROOT_DRIVE_LOCATION).folderId },
      { onSuccess: close },
    );
  const confirmTrash = () => trash.mutate({ projectId, fileId: file.id }, { onSuccess: close });

  const dialogs: Record<DriveFileOperationType, ReactNode> = {
    [DRIVE_FILE_OPERATIONS.MOVE]: (
      <DriveFolderDialog
        onClose={close}
        title={moveTitle}
        error={moveError}
        projectId={projectId}
        onConfirm={confirmMove}
        isPending={move.isPending}
        description={currentFolder}
        confirmLabel={DRIVE_FILE_COPY.MOVE_CONFIRM}
      />
    ),
    [DRIVE_FILE_OPERATIONS.TRASH]: (
      <DriveTrashDialog
        onClose={close}
        fileName={file.name}
        hasError={trash.isError}
        onConfirm={confirmTrash}
        isPending={trash.isPending}
      />
    ),
  };
  const dialog = operation ? dialogs[operation] : null;

  if (!canManage) {
    return null;
  }

  return (
    <Box sx={styles.actions}>
      <Button
        onClick={openMove}
        ariaLabel={moveLabel}
        text={DRIVE_FILE_COPY.MOVE}
        variant={BUTTON_VARIANTS.NEUTRAL}
      />
      <Button
        onClick={openTrash}
        ariaLabel={deleteLabel}
        text={DRIVE_FILE_COPY.DELETE}
        variant={BUTTON_VARIANTS.NEUTRAL}
      />
      {dialog}
    </Box>
  );
};
export default DriveFileActions;
