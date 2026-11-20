import { Box } from "@mui/material";
import { type FC, useState } from "react";
import DriveFolderPicker from "./DriveFolderPicker";
import InlineError from "../../../components/InlineError/InlineError";
import GenericPopup from "../../../components/GenericPopup/GenericPopup";
import { useProjectDriveQuery } from "../../../hooks/queries/project.query";
import type { IDriveFolderLocation } from "../../../interfaces/drive-file.interface";
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
    <GenericPopup
      open
      title={title}
      onClose={close}
      closeAfterAction={false}
      closeDisabled={isPending}
      buttons={{
        primary: { text: confirmLabel, isDisabled, onClick: () => onConfirm(path) },
        secondary: { text: DRIVE_FILE_COPY.CANCEL, isDisabled: isPending, onClick: close },
      }}
      content={
        <Box>
          {description && <Box component="p">{description}</Box>}
          <DriveFolderPicker
            path={path}
            onChange={setPath}
            disabled={isPending}
            projectId={projectId}
          />
          {error && <InlineError message={error} />}
        </Box>
      }
    />
  );
};
export default DriveFolderDialog;
