export interface IDriveFolderLocation {
  name: string;
  folderId: string | null;
}

export interface IDriveFileAction {
  fileId: string;
  projectId: string;
}

export interface IDriveFileMove extends IDriveFileAction {
  folderId: string | null;
}
