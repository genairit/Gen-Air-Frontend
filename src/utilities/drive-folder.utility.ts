import {
  DRIVE_FOLDER_COPY,
  DRIVE_ERROR_CODES,
  GOOGLE_DRIVE_FOLDER_URL,
  FOLDER_CONTENT_STATUSES,
  DRIVE_STATUS_BADGE_STATES,
  DRIVE_UNAVAILABLE_STATUSES,
  type FolderContentStatusType,
  type DriveStatusBadgeStateType,
} from "../constants/drive-folder.constant";

import { isAxiosError } from "axios";
import { formatFileCount } from "./text.utility";
import { isRecord } from "./guards/primitive.guard";
import { HTTP_STATUS } from "../constants/api.constant";
import type { IProjectFolder } from "../interfaces/project.interface";

interface IFolderBadgeOptions {
  isRefreshing: boolean;
  contentStatus: FolderContentStatusType;
}

interface IDriveFolderViewOptions {
  isRefreshing: boolean;
  folder: IProjectFolder;
}

interface IRootContentOptions {
  rootFileCount: number;
  folders: IProjectFolder[];
}

const CAPTION_BY_STATE: Record<DriveStatusBadgeStateType, (fileCount: number | null) => string> = {
  empty: () => DRIVE_FOLDER_COPY.EMPTY,
  unknown: () => DRIVE_FOLDER_COPY.UNKNOWN,
  loading: () => DRIVE_FOLDER_COPY.CHECKING,
  has_content: fileCount => formatFileCount(fileCount ?? 0),
};

export const getFolderBadgeState = ({
  isRefreshing,
  contentStatus,
}: IFolderBadgeOptions): DriveStatusBadgeStateType => {
  if (isRefreshing) {
    return DRIVE_STATUS_BADGE_STATES.LOADING;
  }

  return contentStatus;
};

export const formatFolderCaption = (state: DriveStatusBadgeStateType, fileCount: number | null) =>
  CAPTION_BY_STATE[state](fileCount);

const hasFolderWithStatus = (folders: IProjectFolder[], status: FolderContentStatusType) =>
  folders.some(folder => folder.contentStatus === status);

export const hasUnknownFolder = (folders: IProjectFolder[]) =>
  hasFolderWithStatus(folders, FOLDER_CONTENT_STATUSES.UNKNOWN);

export const getRootContentStatus = ({
  folders,
  rootFileCount,
}: IRootContentOptions): FolderContentStatusType => {
  const hasRootFiles = rootFileCount > 0;
  const hasFolderContent = hasFolderWithStatus(folders, FOLDER_CONTENT_STATUSES.HAS_CONTENT);

  if (hasRootFiles || hasFolderContent) {
    return FOLDER_CONTENT_STATUSES.HAS_CONTENT;
  }

  if (hasUnknownFolder(folders)) {
    return FOLDER_CONTENT_STATUSES.UNKNOWN;
  }

  return FOLDER_CONTENT_STATUSES.EMPTY;
};

export const isDriveUnavailableError = (error?: unknown) => {
  if (!isAxiosError(error)) {
    return false;
  }

  return DRIVE_UNAVAILABLE_STATUSES.includes(error.response?.status ?? 0);
};

export const toDriveFolderView = ({ folder, isRefreshing }: IDriveFolderViewOptions) => {
  const badgeState = getFolderBadgeState({ isRefreshing, contentStatus: folder.contentStatus });

  return { folder, badgeState, caption: formatFolderCaption(badgeState, folder.fileCount) };
};

export const getEmptyFolderNote = (subfolders: IProjectFolder[]) => {
  const hasSubfolders = subfolders.length > 0;

  if (hasSubfolders) {
    return DRIVE_FOLDER_COPY.NESTED_EMPTY;
  }

  return DRIVE_FOLDER_COPY.NO_FILES;
};

export const isDriveFolderMissingError = (error: unknown) =>
  isAxiosError(error) && error.response?.status === HTTP_STATUS.CONFLICT;

export const getDriveRecoveryError = (error: unknown) => {
  const body: unknown = isAxiosError(error) ? error.response?.data : null;
  if (isRecord(body) && body.code === DRIVE_ERROR_CODES.AUTHENTICATION_FAILED) {
    return DRIVE_FOLDER_COPY.AUTHENTICATION_FAILED;
  }
  return DRIVE_FOLDER_COPY.PROVISION_FAILED;
};

export const toDriveFolderUrl = (folderId: string) =>
  GOOGLE_DRIVE_FOLDER_URL + encodeURIComponent(folderId);
