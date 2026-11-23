import type { DriveFolderModeType } from "../constants/existing-drive-folder.constant";

export interface IExistingDriveFolderPreview {
  id: string;
  name: string;
  missingTemplateFolders: string[];
}

export interface IExistingDriveFolderState {
  reference: string;
  reset: () => void;
  canSubmit: boolean;
  isPending: boolean;
  error: string | null;
  mode: DriveFolderModeType;
  retry: () => Promise<void>;
  existingDriveFolder: string | null;
  setReference: (value: string) => void;
  preview: IExistingDriveFolderPreview | null;
  setMode: (mode: DriveFolderModeType) => void;
}
