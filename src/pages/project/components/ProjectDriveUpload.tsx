import {
  PROJECT_PAGE_COPY,
  PROJECT_PAGE_STATUS_COPY,
} from "../../../constants/project-page.constant";

import { Box } from "@mui/material";
import { type FC, useState } from "react";
import { usePageStyles } from "../../page.style";
import DriveFolderDialog from "./DriveFolderDialog";
import Button from "../../../components/Button/Button";
import DropZone from "../../../components/DropZone/DropZone";
import InlineError from "../../../components/InlineError/InlineError";
import LoadingState from "../../../components/LoadingState/LoadingState";
import { getApiErrorMessage } from "../../../utilities/api-error.utility";
import { useDriveUploadPolicyQuery } from "../../../hooks/queries/project.query";
import type { IDriveFolderLocation } from "../../../interfaces/drive-file.interface";
import { useUploadProjectFilesMutation } from "../../../hooks/mutations/project.mutation";
import { DRIVE_FILE_COPY, ROOT_DRIVE_LOCATION } from "../../../constants/drive-file.constant";
import { getUploadAccept, getUploadDescription } from "../../../utilities/drive-upload.utility";

interface IProjectDriveUploadProps {
  projectId: string;
}

const ProjectDriveUpload: FC<IProjectDriveUploadProps> = ({ projectId }) => {
  const styles = usePageStyles();
  const [path, setPath] = useState<IDriveFolderLocation[]>([ROOT_DRIVE_LOCATION]);
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

  return (
    <Box sx={styles.stack({})}>
      <Box component="span" sx={styles.caption}>
        {destinationLabel}
      </Box>
      <Button
        disabled={uploadMutation.isPending}
        onClick={() => setIsChoosing(true)}
        text={DRIVE_FILE_COPY.CHOOSE_FOLDER}
      />
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
      {uploadMutation.isPending && <LoadingState label={PROJECT_PAGE_STATUS_COPY.UPLOADING} />}
      {uploadMutation.isError && <InlineError message={getApiErrorMessage(uploadMutation.error)} />}
    </Box>
  );
};

export default ProjectDriveUpload;
