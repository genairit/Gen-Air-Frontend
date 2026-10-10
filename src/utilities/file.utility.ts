import type { ChangeEvent, DragEvent } from "react";

export const getDroppedFiles = (event: DragEvent<HTMLElement>) =>
  Array.from(event.dataTransfer.files);

export const getSelectedFiles = (event: ChangeEvent<HTMLInputElement>) =>
  Array.from(event.target.files ?? []);

const BYTES_PER_KILOBYTE = 1024;

const FILE_SIZE_UNITS = ["B", "KB", "MB", "GB"];

export const formatFileSize = (bytes: number | null) => {
  if (bytes == null) {
    return "";
  }

  const unitIndex = Math.min(
    FILE_SIZE_UNITS.length - 1,
    Math.floor(Math.log(Math.max(bytes, 1)) / Math.log(BYTES_PER_KILOBYTE)),
  );
  const value = bytes / BYTES_PER_KILOBYTE ** unitIndex;

  return `${value.toFixed(1)} ${FILE_SIZE_UNITS[unitIndex]}`;
};
