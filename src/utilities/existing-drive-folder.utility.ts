import { DRIVE_FOLDER_MODES } from "../constants/existing-drive-folder.constant";
import type { DriveFolderModeType } from "../constants/existing-drive-folder.constant";
import type { IExistingDriveFolderPreview } from "../interfaces/existing-drive-folder.interface";

interface IExistingDriveSelection {
  isCurrent: boolean;
  mode: DriveFolderModeType;
  preview: IExistingDriveFolderPreview | null;
}

export const toExistingDriveFolder = ({
  mode,
  isCurrent,
  preview,
}: IExistingDriveSelection): string | null => {
  const isExisting = mode === DRIVE_FOLDER_MODES.EXISTING;
  return isExisting && isCurrent ? (preview?.id ?? null) : null;
};

export const existingDriveFolderPayload = (
  folderId?: string | null,
): { existingDriveFolder?: string } => (folderId ? { existingDriveFolder: folderId } : {});

export const formatMissingTemplateFolders = (folders: readonly string[]): string =>
  `חסרות ${folders.length} תיקיות מהתבנית`;
