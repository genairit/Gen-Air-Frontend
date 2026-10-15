import type {
  IDriveUploadType,
  IDriveUploadPolicy,
} from "../../interfaces/drive-upload-policy.interface";

import { isRecord } from "./primitive.guard";

const isUploadType = (value: unknown): value is IDriveUploadType => {
  if (!isRecord(value)) {
    return false;
  }
  return (
    ["binary", "text", "dxf", "zip", "office"].includes(String(value.kind)) &&
    typeof value.mimeType === "string" &&
    Array.isArray(value.signatures) &&
    value.signatures.every(
      signature =>
        Array.isArray(signature) &&
        signature.every(byte => Number.isInteger(byte) && byte >= 0 && byte <= 255),
    )
  );
};
export const isDriveUploadPolicy = (value: unknown): value is IDriveUploadPolicy => {
  if (!isRecord(value) || !isRecord(value.types)) {
    return false;
  }
  const limits = [
    value.maxFiles,
    value.maxFileSizeBytes,
    value.maxArchiveSizeBytes,
    value.maxTextSizeBytes,
  ];
  return (
    limits.every(limit => typeof limit === "number" && Number.isSafeInteger(limit) && limit > 0) &&
    typeof value.blockedNamePattern === "string" &&
    Object.keys(value.types).length > 0 &&
    Object.values(value.types).every(isUploadType)
  );
};
