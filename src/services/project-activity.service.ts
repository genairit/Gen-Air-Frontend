import {
  isApiDriveContents,
  isApiStageTransition,
  isApiTemplateFolderNode,
} from "../utilities/guards/api.guard";

import { isArrayOf } from "../utilities/guards/primitive.guard";
import { httpClient, ensureResponse } from "./http-client.service";
import { validateProjectFiles } from "../utilities/drive-upload.utility";
import { isDriveUploadPolicy } from "../utilities/guards/drive-upload.guard";
import { API_ENDPOINTS, DRIVE_UPLOAD_FIELD_NAME } from "../constants/api.constant";

const toFolderParams = (folderId: string | null) => (folderId ? { folderId } : {});

class ProjectActivityService {
  async getTransitions(projectId: string) {
    const endpoint = API_ENDPOINTS.projectTransitions(projectId);
    const response = await httpClient.get<unknown>(endpoint);

    return ensureResponse(endpoint, response.data, isArrayOf(isApiStageTransition));
  }

  async getDriveContents(projectId: string, folderId: string | null) {
    const endpoint = API_ENDPOINTS.projectDriveContents(projectId);
    const response = await httpClient.get<unknown>(endpoint, { params: toFolderParams(folderId) });

    return ensureResponse(endpoint, response.data, isApiDriveContents);
  }

  async getUploadPolicy() {
    const endpoint = API_ENDPOINTS.DRIVE_UPLOAD_POLICY;
    const response = await httpClient.get<unknown>(endpoint);
    return ensureResponse(endpoint, response.data, isDriveUploadPolicy);
  }

  async uploadFiles(projectId: string, files: File[]) {
    const policy = await this.getUploadPolicy();
    await validateProjectFiles(files, policy);
    const formData = new FormData();

    files.forEach(file => formData.append(DRIVE_UPLOAD_FIELD_NAME, file));

    await httpClient.post(API_ENDPOINTS.projectDriveFiles(projectId), formData);
  }

  async getTemplateTree() {
    const response = await httpClient.get<unknown>(API_ENDPOINTS.DRIVE_TEMPLATE_FOLDERS);

    return ensureResponse(
      API_ENDPOINTS.DRIVE_TEMPLATE_FOLDERS,
      response.data,
      isArrayOf(isApiTemplateFolderNode),
    );
  }
}

export const projectActivityService = new ProjectActivityService();
