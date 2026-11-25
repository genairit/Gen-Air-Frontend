import { type MutableRefObject, useEffect, useRef } from "react";
import { abortActiveController, releaseActiveController } from "../utilities/abort.utility";

interface IUseDebouncedAbortableCallbackOptions {
  delayMs: number;
  isEnabled: boolean;
  callback: (signal: AbortSignal) => Promise<void> | void;
}

interface IDebouncedAbortableCallbackRefs {
  timerRef: MutableRefObject<number | null>;
  controllerRef: MutableRefObject<AbortController | null>;
}

const clearDebounceTimer = (timerRef: MutableRefObject<number | null>): void => {
  if (timerRef.current === null) {
    return;
  }

  clearTimeout(timerRef.current);
  timerRef.current = null;
};

const cancelDebouncedAbortableCallback = ({
  timerRef,
  controllerRef,
}: IDebouncedAbortableCallbackRefs): void => {
  clearDebounceTimer(timerRef);
  abortActiveController(controllerRef);
};

const scheduleDebouncedAbortableCallback = ({
  delayMs,
  callback,
  timerRef,
  controllerRef,
}: IDebouncedAbortableCallbackRefs &
  Pick<IUseDebouncedAbortableCallbackOptions, "delayMs" | "callback">): void => {
  const controller = new AbortController();

  controllerRef.current = controller;
  timerRef.current = window.setTimeout(async () => {
    timerRef.current = null;

    try {
      await callback(controller.signal);
    } finally {
      releaseActiveController({ controller, controllerRef });
    }
  }, delayMs);
};

export const useDebouncedAbortableCallback = ({
  delayMs,
  callback,
  isEnabled,
}: IUseDebouncedAbortableCallbackOptions): void => {
  const timerRef = useRef<number | null>(null);
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const refs = { timerRef, controllerRef };

    cancelDebouncedAbortableCallback(refs);

    if (!isEnabled) {
      return;
    }

    scheduleDebouncedAbortableCallback({ delayMs, callback, ...refs });

    return () => {
      cancelDebouncedAbortableCallback(refs);
    };
  }, [callback, delayMs, isEnabled]);
};
