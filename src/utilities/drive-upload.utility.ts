import type {
  IDriveUploadType,
  IDriveUploadPolicy,
} from "../interfaces/drive-upload-policy.interface";

import { formatFileSize } from "./file.utility";
import { hasControlCharacters } from "./control-characters.utility";
import { UPLOAD_VALIDATION_COPY } from "../constants/drive-upload.constant";
import { PROJECT_DRIVE_UPLOAD_DESCRIPTION } from "../constants/project.constant";

export class UploadValidationError extends Error {}
const rejectFile = (message: string, name: string) => {
  throw new UploadValidationError(`${message} (${name})`);
};
const getType = (file: File, policy: IDriveUploadPolicy) => {
  const extension = file.name.split(".").at(-1)?.toLowerCase() ?? "";
  const type = Object.hasOwn(policy.types, extension) ? policy.types[extension] : null;
  const invalidName =
    file.name !== file.name.trim() ||
    file.name.length === 0 ||
    file.name.length > 255 ||
    new RegExp(policy.blockedNamePattern, "i").test(file.name);
  if (!type || invalidName) {
    return rejectFile(UPLOAD_VALIDATION_COPY.UNSUPPORTED, file.name);
  }
  const archive = type.kind === "zip" || type.kind === "office";
  const text = type.kind === "text" || type.kind === "dxf";
  const tooLarge =
    file.size > policy.maxFileSizeBytes ||
    (archive && file.size > policy.maxArchiveSizeBytes) ||
    (text && file.size > policy.maxTextSizeBytes);
  if (file.size <= 0 || tooLarge) {
    rejectFile(UPLOAD_VALIDATION_COPY.INVALID_SIZE, file.name);
  }
  return type;
};
const checkContent = (bytes: Uint8Array, type: IDriveUploadType, file: File) => {
  const textKind = type.kind === "text" || type.kind === "dxf";
  const matches = type.signatures.some(signature =>
    signature.every((byte, index) => bytes[index] === byte),
  );
  if (!textKind && !matches) {
    rejectFile(UPLOAD_VALIDATION_COPY.INVALID_CONTENT, file.name);
  }
  const text = new TextDecoder().decode(bytes);
  if (
    type.mimeType === "image/webp" &&
    new TextDecoder().decode(bytes.subarray(8, 12)) !== "WEBP"
  ) {
    rejectFile(UPLOAD_VALIDATION_COPY.INVALID_CONTENT, file.name);
  }
  if (type.mimeType === "image/vnd.dwg" && !/^AC10\d{2}/.test(text.slice(0, 6))) {
    rejectFile(UPLOAD_VALIDATION_COPY.INVALID_CONTENT, file.name);
  }
  if (!textKind) {
    return;
  }
  const binaryDxf = text.startsWith("AutoCAD Binary DXF\r\n\x1a\0");
  if (type.kind === "dxf" && binaryDxf) {
    return;
  }
  const decoded = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  const controls = hasControlCharacters(decoded, [9, 10, 13]);
  const invalidDxf = type.kind === "dxf" && !/^\s*0\s+SECTION\s*$/im.test(decoded);
  if (controls || invalidDxf) {
    rejectFile(UPLOAD_VALIDATION_COPY.INVALID_CONTENT, file.name);
  }
};
export const validateProjectFiles = async (files: File[], policy: IDriveUploadPolicy) => {
  if (files.length === 0) {
    throw new UploadValidationError(UPLOAD_VALIDATION_COPY.FILES_REQUIRED);
  }
  if (files.length > policy.maxFiles) {
    throw new UploadValidationError(UPLOAD_VALIDATION_COPY.TOO_MANY);
  }
  for (const file of files) {
    const type = getType(file, policy);
    const readSize = type.kind === "text" || type.kind === "dxf" ? file.size : 8192;
    try {
      checkContent(new Uint8Array(await file.slice(0, readSize).arrayBuffer()), type, file);
    } catch (error) {
      if (error instanceof UploadValidationError) {
        throw error;
      }
      rejectFile(UPLOAD_VALIDATION_COPY.READ_FAILED, file.name);
    }
  }
};
export const getUploadAccept = (policy: IDriveUploadPolicy | null) =>
  policy
    ? Object.keys(policy.types)
        .map(extension => `.${extension}`)
        .join(",")
    : "";

export const getUploadDescription = (policy: IDriveUploadPolicy | null) => {
  if (!policy) {
    return PROJECT_DRIVE_UPLOAD_DESCRIPTION;
  }
  return `${PROJECT_DRIVE_UPLOAD_DESCRIPTION} · עד ${formatFileSize(policy.maxFileSizeBytes)} לקובץ, ${formatFileSize(policy.maxArchiveSizeBytes)} לארכיון ו-${formatFileSize(policy.maxTextSizeBytes)} לטקסט`;
};
