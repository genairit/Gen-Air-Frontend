import { useEffect, useRef } from "react";
import { registerEventListener } from "../utilities/event-listener.utility";
import { type IUseEventListenerOptions } from "../interfaces/event-listener.interface";

export const useEventListener = ({
  type,
  target,
  listener,
  capture = false,
  isEnabled = true,
}: IUseEventListenerOptions): void => {
  const listenerRef = useRef(listener);

  useEffect((): void => {
    listenerRef.current = listener;
  }, [listener]);

  useEffect((): (() => void) | void => {
    if (!isEnabled || !target) {
      return;
    }

    const controller = new AbortController();

    registerEventListener({
      type,
      target,
      listener: (event: Event): void => listenerRef.current(event),
      options: { capture, signal: controller.signal },
    });

    return (): void => controller.abort();
  }, [type, target, capture, isEnabled]);
};
