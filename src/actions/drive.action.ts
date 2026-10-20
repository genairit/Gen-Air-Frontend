import { queryClient } from "../providers/query-client";
import { QUERY_ROOTS } from "../constants/query-key.constant";
import { DRIVE_FILE_COPY } from "../constants/drive-file.constant";
import { useDriveFeedbackStore } from "../store/drive-feedback.store";
import { projectActivityService } from "../services/project-activity.service";
import type { IDriveFileAction, IDriveFileMove } from "../interfaces/drive-file.interface";

export const uploadProjectFilesAction = async ({
  projectId,
  files,
  folderId = null,
}: {
  projectId: string;
  files: File[];
  folderId?: string | null;
}) => {
  useDriveFeedbackStore.getState().clear(projectId);
  await projectActivityService.uploadFiles(projectId, files, folderId);
  useDriveFeedbackStore.getState().show(projectId, DRIVE_FILE_COPY.UPLOAD_SUCCESS);
  await queryClient.invalidateQueries({ queryKey: [QUERY_ROOTS.PROJECT_DRIVE, projectId] });
};

export const provisionProjectDriveAction = async (projectId: string) => {
  await projectActivityService.provisionDrive(projectId);
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: [QUERY_ROOTS.PROJECT_DRIVE, projectId] }),
    queryClient.invalidateQueries({ queryKey: [QUERY_ROOTS.PROJECT, projectId] }),
  ]);
};

export const moveProjectDriveFileAction = async ({
  projectId,
  fileId,
  folderId,
}: IDriveFileMove) => {
  useDriveFeedbackStore.getState().clear(projectId);
  await projectActivityService.moveDriveFile(projectId, fileId, folderId);
  useDriveFeedbackStore.getState().show(projectId, DRIVE_FILE_COPY.MOVE_SUCCESS);
  await queryClient.invalidateQueries({ queryKey: [QUERY_ROOTS.PROJECT_DRIVE, projectId] });
};

export const trashProjectDriveFileAction = async ({ projectId, fileId }: IDriveFileAction) => {
  useDriveFeedbackStore.getState().clear(projectId);
  await projectActivityService.trashDriveFile(projectId, fileId);
  useDriveFeedbackStore.getState().show(projectId, DRIVE_FILE_COPY.DELETE_SUCCESS);
  await queryClient.invalidateQueries({ queryKey: [QUERY_ROOTS.PROJECT_DRIVE, projectId] });
};
