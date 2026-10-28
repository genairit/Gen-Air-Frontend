import { useState, type DragEvent } from "react";

interface IDropZoneOptions<TPayload> {
  onDrop: (payload: TPayload) => void | Promise<void>;
  readPayload: (event: DragEvent<HTMLElement>) => TPayload;
}

const isLeavingElement = (event: DragEvent<HTMLElement>) => {
  const nextTarget = event.relatedTarget;

  if (!(nextTarget instanceof Node)) {
    return true;
  }

  return !event.currentTarget.contains(nextTarget);
};

export const useDropZone = <TPayload>({ readPayload, onDrop }: IDropZoneOptions<TPayload>) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (event: DragEvent<HTMLElement>) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (event: DragEvent<HTMLElement>) => {
    if (!isLeavingElement(event)) {
      return;
    }

    setIsDragOver(false);
  };

  const handleDrop = async (event: DragEvent<HTMLElement>): Promise<void> => {
    event.preventDefault();
    setIsDragOver(false);
    await onDrop(readPayload(event));
  };

  return {
    isDragOver,
    dropZoneProps: { onDrop: handleDrop, onDragOver: handleDragOver, onDragLeave: handleDragLeave },
  };
};

export type TDropZoneProps = ReturnType<typeof useDropZone>["dropZoneProps"];
