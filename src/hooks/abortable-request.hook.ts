import { useEffect, useRef } from "react";
import { abortActiveController, releaseActiveController } from "../utilities/abort.utility";

type TAbortableRequest = (signal: AbortSignal) => Promise<void>;

interface IAbortableRequest {
  abortActive: () => void;
  runAbortable: (request: TAbortableRequest) => Promise<void>;
}

export const useAbortableRequest = (): IAbortableRequest => {
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

  const abortActive = (): void => abortActiveController(controllerRef);

  return { runAbortable, abortActive };
};
