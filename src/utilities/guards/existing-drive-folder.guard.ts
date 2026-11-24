import { isRecord } from "./primitive.guard";
import type { IExistingDriveFolderPreview } from "../../interfaces/existing-drive-folder.interface";

export const isStringList = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every(item => typeof item === "string");

export const isExistingDriveFolderPreview = (
  value: unknown,
): value is IExistingDriveFolderPreview => {
  if (!isRecord(value)) {
    return false;
  }

  const hasIdentity = typeof value.id === "string" && value.id.length > 0;
  const hasName = typeof value.name === "string" && value.name.length > 0;
  return hasIdentity && hasName && isStringList(value.missingTemplateFolders);
};
