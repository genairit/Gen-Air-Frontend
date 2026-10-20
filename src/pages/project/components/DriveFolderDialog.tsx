import { type FC, useState } from "react";
import DriveFolderPicker from "./DriveFolderPicker";
import { useStyles } from "./DriveFileManager.style";
import Button from "../../../components/Button/Button";
import InlineError from "../../../components/InlineError/InlineError";
import { useProjectDriveQuery } from "../../../hooks/queries/project.query";
import { Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import type { IDriveFolderLocation } from "../../../interfaces/drive-file.interface";
import { BUTTON_VARIANTS } from "../../../components/Button/constants/button.constants";
import { DRIVE_FILE_COPY, ROOT_DRIVE_LOCATION } from "../../../constants/drive-file.constant";

interface IDriveFolderDialogProps {
  title: string;
  projectId: string;
  isPending?: boolean;
  onClose: () => void;
  description?: string;
  confirmLabel: string;
  error: string | null;
  initialPath?: IDriveFolderLocation[];
  onConfirm: (path: IDriveFolderLocation[]) => void;
}

const DriveFolderDialog: FC<IDriveFolderDialogProps> = ({
  title,
  description,
  projectId,
  confirmLabel,
  error,
  isPending = false,
  initialPath = [ROOT_DRIVE_LOCATION],
  onClose,
  onConfirm,
}) => {
  const styles = useStyles();
  const [path, setPath] = useState(initialPath);
  const location = path.at(-1) ?? ROOT_DRIVE_LOCATION;
  const query = useProjectDriveQuery(projectId, location.folderId);
  const isDisabled = isPending || !query.isSuccess;
  const close = () => {
    if (!isPending) {
      onClose();
    }
  };

  return (
    <Dialog
      open
      fullWidth
      maxWidth="sm"
      onClose={close}
      slotProps={{ paper: { sx: styles.dialog } }}
    >
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        {description && <p>{description}</p>}
        <DriveFolderPicker
          path={path}
          onChange={setPath}
          disabled={isPending}
          projectId={projectId}
        />
        {error && <InlineError message={error} />}
      </DialogContent>
      <DialogActions>
        <Button
          onClick={close}
          disabled={isPending}
          text={DRIVE_FILE_COPY.CANCEL}
          variant={BUTTON_VARIANTS.NEUTRAL}
        />
        <Button
          text={confirmLabel}
          disabled={isDisabled}
          isLoading={isPending}
          ariaLabel={confirmLabel}
          onClick={() => onConfirm(path)}
        />
      </DialogActions>
    </Dialog>
  );
};
export default DriveFolderDialog;
