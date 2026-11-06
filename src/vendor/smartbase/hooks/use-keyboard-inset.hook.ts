import { useEffect, useState } from "react";
import { useEventListener } from "./use-event-listener.hook";
import { getKeyboardInset, getVisualViewport } from "../utilities/viewport.utility";

export const useKeyboardInset = (isActive: boolean): number => {
  const visualViewport = getVisualViewport();
  const [keyboardInset, setKeyboardInset] = useState<number>(0);

  const updateInset = (): void => {
    if (!visualViewport) {
      return;
    }

    setKeyboardInset(getKeyboardInset(visualViewport, window.innerHeight));
  };

  useEventListener({
    type: "resize",
    isEnabled: isActive,
    listener: updateInset,
    target: visualViewport,
  });

  useEventListener({
    type: "scroll",
    isEnabled: isActive,
    listener: updateInset,
    target: visualViewport,
  });

  useEffect(() => {
    if (!isActive || !visualViewport) {
      return;
    }

    const frame = window.requestAnimationFrame(() =>
      setKeyboardInset(getKeyboardInset(visualViewport, window.innerHeight)),
    );
    return () => window.cancelAnimationFrame(frame);
  }, [isActive, visualViewport]);

  return keyboardInset;
};
