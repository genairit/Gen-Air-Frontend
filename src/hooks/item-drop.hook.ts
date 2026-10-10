import { useDropZone } from "./drop-zone.hook";
import { readDraggedId } from "../utilities/drag.utility";

export const useItemDrop = (onDropItem: (draggedId: string) => void) =>
  useDropZone({ onDrop: onDropItem, readPayload: readDraggedId });
