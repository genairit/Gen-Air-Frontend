import { useState, type DragEvent } from "react";
import { writeDraggedId } from "../utilities/drag.utility";

export const useDragSource = () => {
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const getDragSourceProps = (id: string) => ({
    draggable: true,
    onDragEnd: () => setDraggingId(null),
    onDragStart: (event: DragEvent<HTMLElement>) => {
      writeDraggedId(event, id);
      setDraggingId(id);
    },
  });

  return { draggingId, getDragSourceProps };
};

export type TDragSourceProps = ReturnType<ReturnType<typeof useDragSource>["getDragSourceProps"]>;
