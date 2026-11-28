import {
  PROJECT_PAGE_COPY,
  PROJECT_PAGE_STATUS_COPY,
} from "../../../constants/project-page.constant";

import {
  BUTTON_SIZES,
  BUTTON_VARIANTS,
} from "../../../components/Button/constants/button.constants";

import { Box } from "@mui/material";
import { type FC, useState } from "react";
import { usePageStyles } from "../../page.style";
import DriveFolderDialog from "./DriveFolderDialog";
import Button from "../../../components/Button/Button";
import DropZone from "../../../components/DropZone/DropZone";
import { useSessionUser } from "../../../store/session.store";
import { PERMISSIONS } from "../../../constants/permission.constant";
import { hasPermission } from "../../../utilities/permission.utility";
import InlineError from "../../../components/InlineError/InlineError";
import GenericPopup from "../../../components/GenericPopup/GenericPopup";
import LoadingState from "../../../components/LoadingState/LoadingState";
import { getApiErrorMessage } from "../../../utilities/api-error.utility";
import { useDriveUploadPolicyQuery } from "../../../hooks/queries/project.query";
import type { IDriveFolderLocation } from "../../../interfaces/drive-file.interface";
import { useUploadProjectFilesMutation } from "../../../hooks/mutations/project.mutation";
import { getUploadAccept, getUploadDescription } from "../../../utilities/drive-upload.utility";
import {
  DRIVE_FILE_COPY,
  DRIVE_BROWSER_COPY,
  ROOT_DRIVE_LOCATION,
} from "../../../constants/drive-file.constant";

interface IProjectDriveUploadProps {
  projectId: string;
  initialPath?: IDriveFolderLocation[];
}

const ProjectDriveUpload: FC<IProjectDriveUploadProps> = ({
  projectId,
  initialPath = [ROOT_DRIVE_LOCATION],
}) => {
  const styles = usePageStyles();
  const user = useSessionUser();
  const canUpload = hasPermission(user, PERMISSIONS.DRIVE_UPLOAD);
  const [path, setPath] = useState<IDriveFolderLocation[]>(initialPath);
  const [open, setOpen] = useState(false);
  const [isChoosing, setIsChoosing] = useState(false);
  const uploadMutation = useUploadProjectFilesMutation();
  const uploadPolicy = useDriveUploadPolicyQuery();
  const location = path.at(-1) ?? ROOT_DRIVE_LOCATION;
  const destinationLabel = `${DRIVE_FILE_COPY.UPLOAD_DESTINATION}: ${path.map(folder => folder.name).join(" / ")}`;
  const chooseFolder = (selectedPath: IDriveFolderLocation[]) => {
    setPath(selectedPath);
    setIsChoosing(false);
  };
  const uploadFiles = (files: File[]) => {
    if (!uploadMutation.isPending) {
      uploadMutation.mutate({ projectId, files, folderId: location.folderId });
    }
  };

  if (!canUpload) {
    return null;
  }

  return (
    <>
      <Button size="compact" onClick={() => setOpen(true)} text={DRIVE_BROWSER_COPY.UPLOAD} />
      <GenericPopup
        open={open}
        onClose={() => setOpen(false)}
        title={DRIVE_BROWSER_COPY.UPLOAD}
        closeDisabled={uploadMutation.isPending}
        buttons={{
          primary: {
            text: DRIVE_BROWSER_COPY.DONE,
            isDisabled: uploadMutation.isPending,
            onClick: () => setOpen(false),
          },
        }}
        content={
          <Box sx={styles.stack({ gap: "12px" })}>
            <Box sx={styles.spacedRow}>
              <Box component="span" sx={styles.caption}>
                {destinationLabel}
              </Box>
              <Button
                size={BUTTON_SIZES.COMPACT}
                variant={BUTTON_VARIANTS.SECONDARY}
                disabled={uploadMutation.isPending}
                onClick={() => setIsChoosing(true)}
                text={DRIVE_FILE_COPY.CHOOSE_FOLDER}
              />
            </Box>
            {isChoosing && (
              <DriveFolderDialog
                error={null}
                initialPath={path}
                projectId={projectId}
                onConfirm={chooseFolder}
                onClose={() => setIsChoosing(false)}
                title={DRIVE_FILE_COPY.CHOOSE_FOLDER}
                confirmLabel={DRIVE_FILE_COPY.SELECT_FOLDER}
              />
            )}
            <DropZone
              compact
              onFilesSelected={uploadFiles}
              disabled={uploadMutation.isPending}
              title={PROJECT_PAGE_COPY.UPLOAD_TITLE}
              buttonLabel={PROJECT_PAGE_COPY.UPLOAD_BUTTON}
              accept={getUploadAccept(uploadPolicy.data ?? null)}
              description={getUploadDescription(uploadPolicy.data ?? null)}
            />
            {uploadMutation.isPending && (
              <LoadingState label={PROJECT_PAGE_STATUS_COPY.UPLOADING} />
            )}
            {uploadMutation.isError && (
              <InlineError message={getApiErrorMessage(uploadMutation.error)} />
            )}
          </Box>
        }
      />
    </>
  );
};

export default ProjectDriveUpload;
