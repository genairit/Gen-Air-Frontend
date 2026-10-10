import { useDropZone } from "./drop-zone.hook";
import { getDroppedFiles } from "../utilities/file.utility";

export const useFileDrop = (onFiles: (files: File[]) => void) => {
  const { isDragOver, dropZoneProps } = useDropZone({
    onDrop: onFiles,
    readPayload: getDroppedFiles,
  });

  return { isDragging: isDragOver, dropHandlers: dropZoneProps };
};
