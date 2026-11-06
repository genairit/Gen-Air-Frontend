import { useEffect, useRef } from "react";
import { type IUseEventListenerOptions } from "../interfaces/event-listener.interface";

export const useEventListener = ({
  type,
  target,
  listener,
  isEnabled = true,
}: IUseEventListenerOptions): void => {
  const listenerRef = useRef(listener);

  useEffect(() => {
    listenerRef.current = listener;
  }, [listener]);

  useEffect(() => {
    if (!isEnabled || !target) {
      return;
    }

    const controller = new AbortController();

    target.addEventListener(type, event => listenerRef.current(event), {
      signal: controller.signal,
    });

    return () => controller.abort();
  }, [type, target, isEnabled]);
};
