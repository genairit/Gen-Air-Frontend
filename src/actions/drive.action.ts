import { queryClient } from "../providers/query-client";
import { QUERY_ROOTS } from "../constants/query-key.constant";
import { projectActivityService } from "../services/project-activity.service";

export const uploadProjectFilesAction = async ({
  projectId,
  files,
}: {
  projectId: string;
  files: File[];
}) => {
  await projectActivityService.uploadFiles(projectId, files);
  await queryClient.invalidateQueries({ queryKey: [QUERY_ROOTS.PROJECT_DRIVE, projectId] });
};

export const provisionProjectDriveAction = async (projectId: string) => {
  await projectActivityService.provisionDrive(projectId);
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: [QUERY_ROOTS.PROJECT_DRIVE, projectId] }),
    queryClient.invalidateQueries({ queryKey: [QUERY_ROOTS.PROJECT, projectId] }),
  ]);
};
