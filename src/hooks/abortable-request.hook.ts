import { useEffect, useRef } from "react";
import { abortActiveController, releaseActiveController } from "../utilities/abort.utility";

type TAbortableRequest = (signal: AbortSignal) => Promise<void>;

export const useAbortableRequest = () => {
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => () => abortActiveController(controllerRef), []);

  const runAbortable = async (request: TAbortableRequest): Promise<void> => {
    abortActiveController(controllerRef);

    const controller = new AbortController();
    controllerRef.current = controller;

    try {
      await request(controller.signal);
    } finally {
      releaseActiveController({ controllerRef, controller });
    }
  };

  const abortActive = () => abortActiveController(controllerRef);

  return { runAbortable, abortActive };
};
