import { type DependencyList, type MutableRefObject, useEffect, useRef } from "react";

interface IUseDebouncedAbortableCallbackOptions {
  delayMs: number;
  isEnabled: boolean;
  dependencies: DependencyList;
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

const abortActiveController = (controllerRef: MutableRefObject<AbortController | null>): void => {
  if (controllerRef.current === null) {
    return;
  }

  controllerRef.current.abort();
  controllerRef.current = null;
};

const cancelDebouncedAbortableCallback = ({
  timerRef,
  controllerRef,
}: IDebouncedAbortableCallbackRefs): void => {
  clearDebounceTimer(timerRef);
  abortActiveController(controllerRef);
};

const releaseActiveController = ({
  controllerRef,
  controller,
}: Pick<IDebouncedAbortableCallbackRefs, "controllerRef"> & {
  controller: AbortController;
}): void => {
  if (controllerRef.current !== controller) {
    return;
  }

  controllerRef.current = null;
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
  dependencies,
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
  }, [delayMs, isEnabled, ...dependencies]);
};
