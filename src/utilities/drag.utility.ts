import type { DragEvent } from "react";

const DRAGGED_ID_FORMAT = "text/plain";

export const writeDraggedId = (event: DragEvent<HTMLElement>, id: string) => {
  event.dataTransfer.effectAllowed = "move";
  event.dataTransfer.setData(DRAGGED_ID_FORMAT, id);
};

export const readDraggedId = (event: DragEvent<HTMLElement>) =>
  event.dataTransfer.getData(DRAGGED_ID_FORMAT);
