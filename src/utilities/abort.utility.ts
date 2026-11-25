import { isCancel } from "axios";
import type { MutableRefObject } from "react";

type TControllerRef = MutableRefObject<AbortController | null>;

interface IControllerRelease {
  controller: AbortController;
  controllerRef: TControllerRef;
}

export const abortActiveController = (controllerRef: TControllerRef): void => {
  if (controllerRef.current === null) {
    return;
  }

  controllerRef.current.abort();
  controllerRef.current = null;
};

export const releaseActiveController = ({
  controllerRef,
  controller,
}: IControllerRelease): void => {
  if (controllerRef.current !== controller) {
    return;
  }

  controllerRef.current = null;
};

export const isCancelledRequest = (error: unknown, signal: AbortSignal): boolean =>
  signal.aborted || isCancel(error);
