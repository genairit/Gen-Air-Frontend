import {
  DRIVE_FOLDER_LINK_ERROR_COPY,
  DRIVE_FOLDER_LINK_ERROR_MESSAGES,
} from "../constants/existing-drive-folder.constant";

import { isAxiosError } from "axios";
import { isRecord } from "./guards/primitive.guard";
import { HTTP_STATUS } from "../constants/api.constant";
import { getApiErrorMessage } from "./api-error.utility";

const getDriveFolderErrorCode = (error: unknown): string | null => {
  const body: unknown = isAxiosError(error) ? error.response?.data : null;
  return isRecord(body) && typeof body.code === "string" ? body.code : null;
};

export const getExistingDriveFolderError = (error: unknown): string => {
  const code = getDriveFolderErrorCode(error);
  if (code !== null && Object.hasOwn(DRIVE_FOLDER_LINK_ERROR_MESSAGES, code)) {
    return DRIVE_FOLDER_LINK_ERROR_MESSAGES[code];
  }

  const status = isAxiosError(error) ? (error.response?.status ?? null) : null;
  const isUnauthorized = status === HTTP_STATUS.FORBIDDEN || status === HTTP_STATUS.UNAUTHORIZED;
  return isUnauthorized
    ? DRIVE_FOLDER_LINK_ERROR_COPY.UNAUTHORIZED
    : DRIVE_FOLDER_LINK_ERROR_COPY.UNAVAILABLE;
};

export const isExistingDriveFolderError = (error: unknown): boolean => {
  const code = getDriveFolderErrorCode(error);
  return code !== null && Object.hasOwn(DRIVE_FOLDER_LINK_ERROR_MESSAGES, code);
};

export const getProjectMutationError = (error: unknown): string => {
  return isExistingDriveFolderError(error)
    ? getExistingDriveFolderError(error)
    : getApiErrorMessage(error);
};
